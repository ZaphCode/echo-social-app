/**
 * Loads the predefined users, services, contrataciones and demo activity.
 * Run on a clean database (see reset.ts):
 *
 *   bun run db:seed
 *   bun run db:reseed      # reset + seed
 */
import type { SupabaseClient } from "@supabase/supabase-js";

import { FINISHED_JOBS, OPEN_NEGOTIATIONS } from "./data/activity";
import { CONTRACTINGS, SERVICES } from "./data/catalog";
import { SEED_PASSWORD, STATE, USERS, type SeedUser } from "./data/users";
import {
  createAdminClient,
  fail,
  isMain,
  must,
  projectRef,
  requireConfirmation,
} from "./lib/admin";
import { listSeedImages, uploadSeedImages } from "./lib/storage";
import { reset } from "./reset";

const DAY_MS = 24 * 60 * 60 * 1000;

const daysFromNow = (days: number, hour = 10) => {
  const date = new Date(Date.now() + days * DAY_MS);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
};

function lookup<T>(map: Map<string, T>, key: string, what: string): T {
  const value = map.get(key);
  if (value === undefined) throw new Error(`${what} desconocido: "${key}"`);
  return value;
}

async function loadCategories(admin: SupabaseClient) {
  const rows = must(
    await admin.from("service_category").select("id, name"),
    "Leyendo categorías"
  );
  return new Map(rows.map((row) => [row.name as string, row.id as string]));
}

async function assertCleanSlate(admin: SupabaseClient) {
  const emails = new Set(USERS.map((user) => user.email));
  const { users } = must(
    await admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    "Listando usuarios"
  );
  const existing = users.filter((user) => user.email && emails.has(user.email));

  if (existing.length > 0) {
    fail(
      `Ya existen ${existing.length} usuarios de la seed (p. ej. ${existing[0].email}). ` +
        "Corre `bun run db:reseed -- --yes` para resetear y volver a cargar."
    );
  }
}

async function createUser(
  admin: SupabaseClient,
  user: SeedUser,
  categories: Map<string, string>
) {
  const { user: authUser } = must(
    await admin.auth.admin.createUser({
      email: user.email,
      password: SEED_PASSWORD,
      email_confirm: true,
      user_metadata: { name: user.name, role: user.role },
    }),
    `Creando ${user.email}`
  );
  const id = authUser.id;

  // handle_new_user already inserted the profile row; enrich it.
  must(
    await admin
      .from("profiles")
      .update({
        name: user.name,
        role: user.role,
        verified: true,
        location: { lat: user.lat, lon: user.lon },
      })
      .eq("id", id),
    `Actualizando perfil de ${user.email}`
  );

  const contact = {
    user: id,
    phone: user.phone,
    state: STATE,
    city: user.city,
    address: `Col. ${user.colonia}`,
    zip: user.zip,
  };

  if (user.role === "provider") {
    must(
      await admin.from("provider_profile").insert({
        ...contact,
        specialty: lookup(categories, user.specialty, "Categoría"),
        description: user.description,
        experience_years: user.experienceYears,
        available_days: user.availableDays,
      }),
      `Perfil de proveedor de ${user.email}`
    );
  } else {
    must(
      await admin.from("client_profile").insert(contact),
      `Perfil de cliente de ${user.email}`
    );
  }

  return id;
}

async function seed(admin: SupabaseClient) {
  const categories = await loadCategories(admin);
  await assertCleanSlate(admin);

  // ---- Users ---------------------------------------------------------
  console.log("\nUsuarios…");
  const userIds = new Map<string, string>();
  for (const user of USERS) {
    userIds.set(user.key, await createUser(admin, user, categories));
    console.log(`  ${user.role === "provider" ? "proveedor" : "cliente  "}  ${user.email}  (${user.city})`);
  }
  const userId = (key: string) => lookup(userIds, key, "Usuario");

  // ---- Services ------------------------------------------------------
  console.log("\nServicios…");
  const serviceIds = new Map<string, { id: string; provider: string }>();
  for (const [index, service] of SERVICES.entries()) {
    const provider = userId(service.provider);
    const photos = await uploadSeedImages(
      admin,
      provider,
      "service",
      listSeedImages("services", service.folder)
    );

    const row = must(
      await admin
        .from("service")
        .insert({
          provider,
          category: lookup(categories, service.category, "Categoría"),
          name: service.name,
          description: service.description,
          base_price: service.basePrice,
          photos,
          // Stagger creation so "recientes" has a stable, varied order.
          created_at: daysFromNow(-(45 - index * 3)),
        })
        .select("id")
        .single(),
      `Servicio ${service.key}`
    );
    serviceIds.set(service.key, { id: row.id, provider });
    console.log(`  ${service.name}  (${photos.length} fotos)`);
  }

  // ---- Contrataciones ------------------------------------------------
  console.log("\nContrataciones…");
  const contractingIds = new Map<string, { id: string; owner: string }>();
  for (const contracting of CONTRACTINGS) {
    const ownerUser = USERS.find((user) => user.key === contracting.owner);
    if (!ownerUser) throw new Error(`Usuario desconocido: "${contracting.owner}"`);
    const owner = userId(contracting.owner);

    const photos = await uploadSeedImages(
      admin,
      owner,
      "contracting",
      listSeedImages("contractings", contracting.folder)
    );

    const row = must(
      await admin
        .from("contracting")
        .insert({
          owner,
          category: lookup(categories, contracting.category, "Categoría"),
          name: contracting.name,
          description: contracting.description,
          base_price: contracting.basePrice,
          photos,
          created_at: daysFromNow(-contracting.daysAgo, 9),
        })
        .select("id")
        .single(),
      `Contratación ${contracting.key}`
    );

    // Exact point; a trigger mirrors a snapped copy to contracting.lat/lon.
    must(
      await admin.from("contracting_location_private").insert({
        contracting: row.id,
        lat: contracting.lat ?? ownerUser.lat,
        lon: contracting.lon ?? ownerUser.lon,
      }),
      `Ubicación de ${contracting.key}`
    );

    contractingIds.set(contracting.key, { id: row.id, owner });
    console.log(`  ${contracting.name}  (${photos.length} fotos)`);
  }

  // ---- Finished jobs + reviews --------------------------------------
  console.log("\nTrabajos finalizados…");
  for (const job of FINISHED_JOBS) {
    const client = userId(job.client);
    const service = lookup(serviceIds, job.service, "Servicio");
    const doneAt = daysFromNow(-job.daysAgo, 12);

    // Inserting as FINISHED fires finalize_finished_service_request,
    // which bumps provider_profile.jobs_done.
    const request = must(
      await admin
        .from("service_request")
        .insert({
          service: service.id,
          client,
          provider: service.provider,
          last_offer_user: service.provider,
          agreed_price: job.agreedPrice,
          agreed_date: daysFromNow(-job.daysAgo),
          notes: job.notes,
          agreement_state: "FINISHED",
          client_offer_status: "COMPLETED",
          provider_offer_status: "COMPLETED",
          requested: daysFromNow(-(job.daysAgo + 3)),
          finished: doneAt,
        })
        .select("id")
        .single(),
      `Solicitud ${job.client} → ${job.service}`
    );

    must(
      await admin.from("review").insert([
        {
          service: service.id,
          request: request.id,
          reviewer: client,
          reviewed: service.provider,
          type: "AS_CLIENT",
          rating: job.clientReview.rating,
          comment: job.clientReview.comment,
          created_at: doneAt,
        },
        {
          service: service.id,
          request: request.id,
          reviewer: service.provider,
          reviewed: client,
          type: "AS_PROVIDER",
          rating: job.providerReview.rating,
          comment: job.providerReview.comment,
          created_at: doneAt,
        },
      ]),
      `Reseñas ${job.client} ↔ ${job.service}`
    );
    console.log(`  ${job.client} → ${job.service}  ★${job.clientReview.rating}/★${job.providerReview.rating}`);
  }

  // ---- Open negotiations --------------------------------------------
  console.log("\nNegociaciones abiertas…");
  for (const negotiation of OPEN_NEGOTIATIONS) {
    const base = {
      agreed_price: negotiation.offer,
      agreed_date: daysFromNow(negotiation.inDays),
      notes: negotiation.notes,
      agreement_state: "NEGOTIATION",
      client_offer_status: "PENDING",
      provider_offer_status: "PENDING",
      requested: daysFromNow(0, 8),
    };

    if (negotiation.kind === "service") {
      const client = userId(negotiation.client);
      const service = lookup(serviceIds, negotiation.service, "Servicio");
      must(
        await admin.from("service_request").insert({
          ...base,
          service: service.id,
          client,
          provider: service.provider,
          last_offer_user: client,
        }),
        `Negociación ${negotiation.client} → ${negotiation.service}`
      );
      console.log(`  ${negotiation.client} solicita ${negotiation.service}`);
    } else {
      const provider = userId(negotiation.provider);
      const contracting = lookup(contractingIds, negotiation.contracting, "Contratación");
      must(
        await admin.from("service_request").insert({
          ...base,
          contracting: contracting.id,
          client: contracting.owner,
          provider,
          last_offer_user: provider,
        }),
        `Aplicación ${negotiation.provider} → ${negotiation.contracting}`
      );
      console.log(`  ${negotiation.provider} aplica a ${negotiation.contracting}`);
    }
  }

  console.log(
    `\n✔ Seed cargada en "${projectRef()}": ${USERS.length} usuarios, ` +
      `${SERVICES.length} servicios, ${CONTRACTINGS.length} contrataciones, ` +
      `${FINISHED_JOBS.length + OPEN_NEGOTIATIONS.length} solicitudes, ` +
      `${FINISHED_JOBS.length * 2} reseñas.` +
      `\n  Contraseña de todos los usuarios: SEED_PASSWORD de .env (o el default de seed/data/users.ts).\n`
  );
}

if (isMain(import.meta)) {
  const admin = createAdminClient();

  if (process.argv.includes("--reset")) {
    requireConfirmation("Esto borra TODOS los usuarios, datos y fotos y recarga la seed");
    await reset(admin);
  }

  await seed(admin);
}
