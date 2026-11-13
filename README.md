<p align="center">
  <img src="assets/app-logo.png" alt="Echo" width="180" />
</p>

<p align="center">
  Marketplace móvil de servicios técnicos y del hogar para Baja California Sur.
</p>

> **Proyecto universitario.** Echo es un prototipo con fines educativos, no una app en producción. Sirvió para practicar desarrollo móvil, modelado de datos, conceptos de sistemas distribuidos y diseño de interfaces, a partir de una problemática local de B.C.S.

## La problemática

En La Paz, San José del Cabo y Cabo San Lucas, conseguir un plomero, un electricista o alguien que dé mantenimiento al minisplit depende casi siempre de recomendaciones de boca en boca o de grupos de Facebook. Para quien contrata es difícil comparar precios y saber si el trabajo es confiable. Para los profesionales independientes es difícil conseguir clientes de forma constante.

Echo conecta a ambos lados en dos direcciones:

- **Servicios:** un profesional publica lo que ofrece (fotos, precio base) y un cliente le envía una solicitud.
- **Contrataciones:** un cliente publica lo que necesita (fotos, presupuesto, ubicación aproximada) y los profesionales aplican.

En los dos casos se abre un chat con un panel de negociación de precio y fecha. Los cambios de estado (aceptar, cancelar, finalizar) requieren que ambas partes estén de acuerdo, y al terminar los dos se califican de 1 a 5 estrellas. La app no procesa pagos.

## Qué se buscaba aprender

| Tema | Dónde se aplica |
|---|---|
| Desarrollo móvil multiplataforma | Una sola base de código en React Native / Expo para iOS y Android, con módulos nativos (SQLite, SecureStore, mapas, ubicación). |
| Modelado de datos | Esquema relacional en Postgres con migraciones versionadas, políticas RLS por rol, triggers y funciones RPC. |
| Sistemas distribuidos | Modo offline-first: réplica local en SQLite, cola de escrituras pendientes, IDs generados en el cliente para que reintentar sea idempotente, resolución de conflictos (gana el servidor) y sincronización del chat al reconectar. |
| Geolocalización con privacidad | Las coordenadas públicas se redondean a una cuadrícula de ~550 m con PostGIS; el punto exacto solo lo ve el dueño de la contratación. |
| Diseño de interfaces | Sistema de diseño propio con tema claro y oscuro, estados de conexión y de envío visibles en cada mensaje. |

## Stack

| Capa | Tecnología |
|---|---|
| App móvil | Expo SDK 57 (*dev client*), React Native 0.86, React 19, TypeScript |
| Navegación y estado | React Navigation 7, TanStack Query 5, Zustand, react-hook-form |
| Backend | Supabase: Postgres 17 + PostGIS, Auth, Storage, Realtime |
| Offline | expo-sqlite (réplica local y cola de mutaciones), expo-network, expo-secure-store |
| Mapas y ubicación | expo-maps (Apple Maps en iOS, Google Maps en Android), expo-location |
| Herramientas | Bun (paquetes, pruebas y scripts de seed), Supabase CLI, Docker |

## Estructura

```text
echo-service-marketplace/
├── App.tsx                 # Providers y montaje de la navegación
├── app.json, app.config.js # Configuración de Expo (ids, permisos, plugins, llave de Google Maps)
├── assets/                 # Logo, íconos, splash y fuentes
├── plugins/                # Config plugins de Expo para los proyectos nativos
├── src/
│   ├── api/                # Acceso a datos por entidad (Supabase + caché local)
│   ├── offline/            # Réplica SQLite, cola de mutaciones, login offline
│   ├── chat/               # Mensajería offline-first y su sincronización
│   ├── context/            # Auth, conectividad, negociación, alertas
│   ├── screens/            # Pantallas
│   ├── components/         # Componentes de UI y formularios
│   ├── navigation/         # Tabs, stacks y control de acceso por rol
│   ├── hooks/, utils/      # Lógica reutilizable (negociación, geo, validaciones)
│   ├── models/             # Tipos de las tablas
│   └── theme/              # Colores, tipografía y espaciado
├── supabase/
│   ├── config.toml         # Stack local de Supabase (Docker)
│   └── migrations/         # Esquema, RLS, triggers, RPC y geolocalización
├── seed/                   # Scripts para resetear y cargar datos de demo (ver seed/README.md)
├── tests/                  # Pruebas unitarias (bun test)
└── docs/                   # Manual técnico y manual de usuario
```

## Ejecutar en local con Docker

Esta guía levanta Supabase en tu máquina con Docker, así que no necesitas una cuenta de Supabase.

### Requisitos

- [Bun](https://bun.sh) 1.3 o superior
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) abierto
- [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started) (`brew install supabase/tap/supabase`)
- Xcode (simulador de iOS) o Android Studio (emulador de Android)

**Expo Go no funciona** con esta app: usa módulos nativos, así que hay que compilar un *development build* (pasos 6 y 7).

### 1. Clonar e instalar

```bash
git clone https://github.com/ZaphCode/echo-service-marketplace.git
```

```bash
cd echo-service-marketplace && bun install
```

### 2. Levantar Supabase

```bash
supabase start
```

La primera vez descarga las imágenes de Docker y tarda unos minutos. Al terminar aplica todas las migraciones de `supabase/migrations/`. El panel de Supabase queda en http://127.0.0.1:54323.

### 3. Configurar `.env`

Consulta las llaves del stack local:

```bash
supabase status -o env
```

Crea un archivo `.env` en la raíz con estos valores:

```
EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
EXPO_PUBLIC_SUPABASE_ANON_KEY=<ANON_KEY>
SUPABASE_SERVICE_ROLE_KEY=<SERVICE_ROLE_KEY>
```

`SUPABASE_SERVICE_ROLE_KEY` solo la usan los scripts de seed, nunca la app.

Opcional: para que el inicio de sesión se llene solo en modo desarrollo, agrega `EXPO_PUBLIC_DEV_EMAIL` y `EXPO_PUBLIC_DEV_PASSWORD` con un usuario de la seed. Si quieres que Android entre con otra cuenta, usa también `EXPO_PUBLIC_DEV_ANDROID_EMAIL` y `EXPO_PUBLIC_DEV_ANDROID_PASSWORD`. Si vas a usar el **emulador de Android**, cambia `127.0.0.1` por `10.0.2.2` en `EXPO_PUBLIC_SUPABASE_URL`. En un **teléfono físico**, usa la IP de tu computadora en la red local.

### 4. Cargar datos de demo

```bash
bun run seed:images
```

```bash
bun run db:seed
```

Esto crea 14 usuarios (9 profesionales y 5 clientes) en La Paz, San José del Cabo y Cabo San Lucas, con 13 servicios, 4 contrataciones, trabajos finalizados con reseñas y algunas negociaciones abiertas. Todos los correos terminan en `@echo.test`, por ejemplo `sofia.aviles@echo.test` (cliente) o `luis.agundez@echo.test` (profesional), y comparten la contraseña `DEFAULT_SEED_PASSWORD` de [`seed/data/users.ts`](seed/data/users.ts).

Para volver a dejar la base como recién cargada: `bun run db:reseed -- --yes`.

### 5. (Opcional) Mapa en Android

En iOS el mapa usa Apple Maps y no requiere nada. En Android necesita una llave de *Maps SDK for Android* en `.env`:

```
GOOGLE_MAPS_ANDROID_API_KEY=...
```

Sin ella, la pestaña Mapa se ve en blanco en Android y el resto de la app funciona igual.

### 6. Compilar la app

```bash
bun run prebuild
```

```bash
bun run ios
```

O `bun run android` para Android. Esto compila el *development build*, lo instala en el simulador o emulador y arranca Metro.

### 7. Siguientes ejecuciones

Con la app ya instalada, solo hace falta tener Supabase arriba (`supabase start`) y arrancar Metro:

```bash
bun start
```

Si cambias algo en `.env`, reinicia Metro con `bun start --clear`: las variables `EXPO_PUBLIC_*` se incrustan al empaquetar.

Para apagar Supabase: `supabase stop`.

## Pruebas

```bash
bun test ./tests
```

Cubren la lógica de negociación, geolocalización, conectividad y validaciones.

## Documentación

- [Manual técnico](docs/MANUAL_TECNICO.md): arquitectura, módulos, sincronización offline y lógica de negociación.
- [Manual de usuario](docs/MANUAL_USUARIO.md): uso de la app por rol.
- [Seed](seed/README.md): scripts de reset y carga de datos.
