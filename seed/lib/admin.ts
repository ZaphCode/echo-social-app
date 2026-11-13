import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Admin client for seed scripts. Uses the service role key, which bypasses
 * RLS and unlocks auth.admin.* — never ship this key in the app.
 *
 * Bun loads `.env` automatically, so these come from the project's `.env`.
 */
export function createAdminClient(): SupabaseClient {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    fail("Falta EXPO_PUBLIC_SUPABASE_URL en .env");
  }
  if (!serviceKey) {
    fail(
      "Falta SUPABASE_SERVICE_ROLE_KEY en .env " +
        "(Supabase Dashboard → Project Settings → API → service_role)."
    );
  }

  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function projectRef() {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
  try {
    return new URL(url).hostname.split(".")[0];
  } catch {
    return "(desconocido)";
  }
}

/** Destructive scripts only run with an explicit `--yes`. */
export function requireConfirmation(action: string) {
  const ref = projectRef();
  console.log(`Proyecto Supabase: ${ref}`);

  if (!process.argv.includes("--yes")) {
    fail(
      `${action} en el proyecto "${ref}". ` +
        "Vuelve a correr el comando con --yes para confirmar."
    );
  }
}

export function fail(message: string): never {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
}

/** Unwraps a Supabase response, throwing with context on error. */
export function must<R extends { data: unknown; error: { message: string } | null }>(
  result: R,
  context: string
): NonNullable<Extract<R, { error: null }>["data"]> {
  if (result.error) {
    throw new Error(`${context}: ${result.error.message}`);
  }
  return result.data as NonNullable<Extract<R, { error: null }>["data"]>;
}

/** True when this module is the script bun was invoked with. */
export function isMain(meta: ImportMeta) {
  return (meta as ImportMeta & { main?: boolean }).main === true;
}
