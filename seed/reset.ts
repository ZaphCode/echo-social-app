/**
 * Wipes the Supabase project: every app row, every Storage object in the
 * app buckets and every Auth user. Service categories are kept (and
 * restored if any is missing).
 *
 *   bun run db:reset -- --yes
 */
import type { SupabaseClient } from "@supabase/supabase-js";

import { createAdminClient, isMain, must, requireConfirmation } from "./lib/admin";
import { listAllObjects } from "./lib/storage";

export const CATEGORY_NAMES = [
  "Albañilería",
  "Plomería",
  "Instalación de Pisos",
  "Electricista",
  "Carpintería",
  "Pintura",
  "Jardinería",
  "Limpieza de Fosas y Biodigestores",
  "Instalación de Aires Acondicionados",
  "Limpieza de Casas y Oficinas",
  "Limpieza de Baños",
];

const BUCKETS = ["avatars", "service-photos"];

/** Tables in foreign-key-safe delete order, with their primary key column. */
const TABLES: Array<[table: string, pk: string]> = [
  ["notification", "id"],
  ["review", "id"],
  ["message", "id"],
  ["contracting_location_private", "contracting"],
  ["service_request", "id"],
  ["contracting", "id"],
  ["service", "id"],
  ["client_profile", "id"],
  ["provider_profile", "id"],
];

async function wipeTables(admin: SupabaseClient) {
  // contracting.closed_request → service_request blocks deleting requests.
  must(
    await admin
      .from("contracting")
      .update({ closed_request: null })
      .not("closed_request", "is", null),
    "Limpiando contracting.closed_request"
  );

  for (const [table, pk] of TABLES) {
    const { count, error } = await admin
      .from(table)
      .delete({ count: "exact" })
      .not(pk, "is", null);

    if (error) throw new Error(`Borrando ${table}: ${error.message}`);
    console.log(`  ${table.padEnd(30)} ${count ?? 0} filas`);
  }
}

async function wipeStorage(admin: SupabaseClient) {
  for (const bucket of BUCKETS) {
    const paths = await listAllObjects(admin, bucket);

    for (let i = 0; i < paths.length; i += 100) {
      must(
        await admin.storage.from(bucket).remove(paths.slice(i, i + 100)),
        `Borrando objetos de ${bucket}`
      );
    }
    console.log(`  ${bucket.padEnd(30)} ${paths.length} archivos`);
  }
}

async function wipeAuthUsers(admin: SupabaseClient) {
  let deleted = 0;

  // Always read page 1: deleting shifts the remaining users forward.
  while (true) {
    const { users } = must(
      await admin.auth.admin.listUsers({ page: 1, perPage: 200 }),
      "Listando usuarios"
    );
    if (users.length === 0) break;

    for (const user of users) {
      const { error } = await admin.auth.admin.deleteUser(user.id);
      if (error) {
        throw new Error(`Borrando usuario ${user.email ?? user.id}: ${error.message}`);
      }
      deleted++;
    }
  }

  console.log(`  ${"auth.users".padEnd(30)} ${deleted} usuarios`);
}

async function ensureCategories(admin: SupabaseClient) {
  must(
    await admin
      .from("service_category")
      .upsert(
        CATEGORY_NAMES.map((name) => ({ name })),
        { onConflict: "name", ignoreDuplicates: true }
      ),
    "Restaurando categorías"
  );

  const { count } = await admin
    .from("service_category")
    .select("id", { count: "exact", head: true });
  console.log(`  ${"service_category".padEnd(30)} ${count ?? "?"} categorías (conservadas)`);
}

export async function reset(admin: SupabaseClient) {
  console.log("\nBorrando datos…");
  await wipeTables(admin);

  console.log("\nVaciando Storage…");
  await wipeStorage(admin);

  console.log("\nBorrando usuarios de Auth…");
  await wipeAuthUsers(admin);

  console.log("\nCategorías…");
  await ensureCategories(admin);

  // Devices compare this on startup and wipe their local replica if it changed.
  const epoch = must(await admin.rpc("bump_data_epoch"), "Cambiando data_epoch");
  console.log(`\nNueva época de datos: ${epoch}`);
}

if (isMain(import.meta)) {
  requireConfirmation("Esto borra TODOS los usuarios, datos y fotos");
  await reset(createAdminClient());
  console.log("\n✔ Base reseteada.\n");
}
