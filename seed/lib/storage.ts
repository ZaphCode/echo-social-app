import { existsSync, readdirSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { SupabaseClient } from "@supabase/supabase-js";

export const IMAGES_DIR = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "images"
);

export const SERVICE_PHOTOS_BUCKET = "service-photos";

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

/**
 * Image files in `seed/images/<kind>/<folder>`, sorted by name. Formats the
 * app can't render everywhere (e.g. .avif) are skipped — keep a .jpg copy.
 */
export function listSeedImages(kind: "services" | "contractings", folder: string) {
  if (!existsSync(IMAGES_DIR)) {
    throw new Error(
      "No existe seed/images. Descomprime las imágenes con `bun run seed:images`."
    );
  }

  const dir = join(IMAGES_DIR, kind, folder);
  const files = readdirSync(dir)
    .filter((name) => CONTENT_TYPES[extname(name).toLowerCase()])
    .sort()
    .map((name) => join(dir, name));

  if (files.length === 0) {
    throw new Error(`No hay imágenes compatibles en ${dir}`);
  }
  return files;
}

/**
 * Uploads local images to `service-photos/<ownerId>/<prefix>_<ts>_<i>.<ext>`,
 * the same layout `uploadServiceImages` / `uploadContractingImages` use in
 * src/api/storage.ts. Returns storage paths (what the app stores in `photos`).
 */
export async function uploadSeedImages(
  admin: SupabaseClient,
  ownerId: string,
  prefix: "service" | "contracting",
  files: string[]
) {
  const stamp = Date.now();

  return Promise.all(
    files.map(async (file, index) => {
      const ext = extname(file).toLowerCase();
      const normalizedExt = ext === ".jpeg" ? ".jpg" : ext;
      const path = `${ownerId}/${prefix}_${stamp}_${index}${normalizedExt}`;
      const bytes = await readFile(file);

      const { error } = await admin.storage
        .from(SERVICE_PHOTOS_BUCKET)
        .upload(path, bytes, { contentType: CONTENT_TYPES[ext], upsert: true });

      if (error) {
        throw new Error(`Subida fallida ${file} → ${path}: ${error.message}`);
      }
      return path;
    })
  );
}

/** Recursively lists every object path in a bucket. */
export async function listAllObjects(
  admin: SupabaseClient,
  bucket: string,
  prefix = ""
): Promise<string[]> {
  const paths: string[] = [];
  const pageSize = 1000;
  let offset = 0;

  while (true) {
    const { data, error } = await admin.storage
      .from(bucket)
      .list(prefix, { limit: pageSize, offset });

    if (error) {
      throw new Error(`Listado de ${bucket}/${prefix}: ${error.message}`);
    }

    for (const entry of data) {
      const full = prefix ? `${prefix}/${entry.name}` : entry.name;
      // Folders come back with a null id.
      if (entry.id === null) {
        paths.push(...(await listAllObjects(admin, bucket, full)));
      } else {
        paths.push(full);
      }
    }

    if (data.length < pageSize) break;
    offset += pageSize;
  }

  return paths;
}
