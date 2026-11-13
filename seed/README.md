# Seed

Scripts para resetear la base de Supabase y cargarla con usuarios, servicios y contrataciones de demo en Baja California Sur.

## Requisitos

En `.env`:

```
EXPO_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...   # Dashboard → Settings → API Keys → Secret keys
SEED_PASSWORD=...                         # opcional; si falta se usa DEFAULT_SEED_PASSWORD de data/users.ts
```

Las imágenes no se versionan, solo `seed/images.zip`. Para descomprimirlas:

```bash
bun run seed:images
```

## Comandos

| Comando | Qué hace |
|---|---|
| `bun run db:reseed -- --yes` | Reset + seed |
| `bun run db:reset -- --yes` | Borra usuarios de Auth, datos y fotos de Storage (conserva categorías) y cambia `app_meta.data_epoch`, para que las apps instaladas borren su base local al abrir |
| `bun run db:seed` | Carga la seed en una base limpia |
| `bun run seed:zip` | Regenera `images.zip` después de cambiar imágenes |

## Estructura

```
seed/
  data/users.ts      proveedores y clientes (ubicación, perfil, especialidad)
  data/catalog.ts    servicios y contrataciones → carpeta de imágenes
  data/activity.ts   trabajos finalizados con reseñas y negociaciones abiertas
  images/            (ignorado por git) services/<slug>/01.jpg, contractings/<slug>/01.jpg
  images.zip         versión comprimida de images/
```

Para agregar un servicio, crea `images/services/<slug>/01.jpg`, agrégalo en `data/catalog.ts` con `folder: "<slug>"` y corre `bun run seed:zip`.
