/**
 * Seed users. Every account shares SEED_PASSWORD (from .env), falling back to
 * DEFAULT_SEED_PASSWORD — a throwaway test value, not a real credential.
 *
 * Coordinates are approximate points inside each colonia; the DB snaps the
 * public copy to a ~550 m grid anyway.
 */

export const DEFAULT_SEED_PASSWORD = "EchoSeed_2026!";

export const SEED_PASSWORD = process.env.SEED_PASSWORD || DEFAULT_SEED_PASSWORD;

export const SEED_EMAIL_DOMAIN = "echo.test";

export const STATE = "Baja California Sur";

export type City = "La Paz" | "San José del Cabo" | "Cabo San Lucas";

export type Day = "LUN" | "MAR" | "MIE" | "JUE" | "VIE" | "SAB" | "DOM";

const WEEKDAYS: Day[] = ["LUN", "MAR", "MIE", "JUE", "VIE"];
const WEEKDAYS_SAT: Day[] = [...WEEKDAYS, "SAB"];

type BaseUser = {
  /** Stable key used by catalog/activity to reference this user. */
  key: string;
  name: string;
  email: string;
  phone: string;
  city: City;
  colonia: string;
  zip: string;
  lat: number;
  lon: number;
};

export type SeedProvider = BaseUser & {
  role: "provider";
  /** Must match a service_category.name. */
  specialty: string;
  description: string;
  experienceYears: number;
  availableDays: Day[];
};

export type SeedClient = BaseUser & { role: "client" };

export type SeedUser = SeedProvider | SeedClient;

const email = (local: string) => `${local}@${SEED_EMAIL_DOMAIN}`;

export const PROVIDERS: SeedProvider[] = [
  {
    key: "ramon",
    role: "provider",
    name: "Ramón Cota Geraldo",
    email: email("ramon.cota"),
    phone: "612 145 2231",
    city: "La Paz",
    colonia: "Pueblo Nuevo",
    zip: "23060",
    lat: 24.1505,
    lon: -110.3022,
    specialty: "Albañilería",
    description:
      "Maestro albañil con cuadrilla propia. Colados de losa, cimentaciones, construcción y ampliación de cuartos. Trabajo con materiales de la región y entrego limpio.",
    experienceYears: 18,
    availableDays: WEEKDAYS_SAT,
  },
  {
    key: "javier",
    role: "provider",
    name: "Javier Lucero Amador",
    email: email("javier.lucero"),
    phone: "624 132 7780",
    city: "San José del Cabo",
    colonia: "El Zacatal",
    zip: "23427",
    lat: 23.0795,
    lon: -109.7048,
    specialty: "Instalación de Pisos",
    description:
      "Instalación de pisos cerámicos, porcelanato, vitropiso y azulejo para baños y cocinas. Nivelación de firmes y acabados finos.",
    experienceYears: 11,
    availableDays: WEEKDAYS_SAT,
  },
  {
    key: "adriana",
    role: "provider",
    name: "Adriana Márquez Ojeda",
    email: email("adriana.marquez"),
    phone: "624 158 9902",
    city: "Cabo San Lucas",
    colonia: "El Tezal",
    zip: "23454",
    lat: 22.9046,
    lon: -109.8812,
    specialty: "Limpieza de Casas y Oficinas",
    description:
      "Limpieza doméstica general y profunda para casas, departamentos y rentas vacacionales. Llevo mis propios productos y equipo.",
    experienceYears: 7,
    availableDays: ["LUN", "MAR", "MIE", "JUE", "VIE", "SAB", "DOM"],
  },
  {
    key: "luis",
    role: "provider",
    name: "Luis Fernando Agúndez",
    email: email("luis.agundez"),
    phone: "624 171 4420",
    city: "Cabo San Lucas",
    colonia: "Mesa Colorada",
    zip: "23450",
    lat: 22.8958,
    lon: -109.9246,
    specialty: "Instalación de Aires Acondicionados",
    description:
      "Técnico en refrigeración certificado. Instalación de minisplits inverter, recarga de gas R410A/R32 y diagnóstico de equipos que no enfrían.",
    experienceYears: 9,
    availableDays: WEEKDAYS_SAT,
  },
  {
    key: "hector",
    role: "provider",
    name: "Héctor Murillo Cosío",
    email: email("hector.murillo"),
    phone: "612 168 3315",
    city: "La Paz",
    colonia: "Las Garzas",
    zip: "23079",
    lat: 24.1338,
    lon: -110.2951,
    specialty: "Instalación de Aires Acondicionados",
    description:
      "Mantenimiento preventivo y limpieza profunda de minisplits y equipos de ventana. Lavado de serpentines con hidrolavadora y revisión de presiones.",
    experienceYears: 6,
    availableDays: WEEKDAYS,
  },
  {
    key: "daniel",
    role: "provider",
    name: "Daniel Higuera Ruiz",
    email: email("daniel.higuera"),
    phone: "612 177 6041",
    city: "La Paz",
    colonia: "Los Olivos",
    zip: "23040",
    lat: 24.1281,
    lon: -110.3019,
    specialty: "Plomería",
    description:
      "Plomero con detector de fugas. Reparación de fugas en tubería de cobre, CPVC y PVC, cambio de llaves, calentadores y tinacos.",
    experienceYears: 14,
    availableDays: WEEKDAYS_SAT,
  },
  {
    key: "carlos",
    role: "provider",
    name: "Carlos Castro Mendoza",
    email: email("carlos.castro"),
    phone: "624 119 5587",
    city: "San José del Cabo",
    colonia: "Santa Rosa",
    zip: "23420",
    lat: 23.0702,
    lon: -109.7081,
    specialty: "Electricista",
    description:
      "Electricista residencial. Ordenamiento y balanceo de centros de carga, instalación de lámparas, contactos y apagadores, y tierras físicas.",
    experienceYears: 12,
    availableDays: WEEKDAYS_SAT,
  },
  {
    key: "marisol",
    role: "provider",
    name: "Marisol Romero Avilés",
    email: email("marisol.romero"),
    phone: "612 190 2276",
    city: "La Paz",
    colonia: "Fovissste",
    zip: "23050",
    lat: 24.1362,
    lon: -110.3168,
    specialty: "Jardinería",
    description:
      "Diseño y decoración de jardines con plantas nativas y de bajo consumo de agua. Macetas, arriates y jardines verticales.",
    experienceYears: 8,
    availableDays: ["MAR", "MIE", "JUE", "VIE", "SAB"],
  },
  {
    key: "joel",
    role: "provider",
    name: "Joel Beltrán Castro",
    email: email("joel.beltran"),
    phone: "624 140 8813",
    city: "San José del Cabo",
    colonia: "El Rosarito",
    zip: "23410",
    lat: 23.0898,
    lon: -109.7127,
    specialty: "Jardinería",
    description:
      "Poda de pasto, desbroce de terrenos, poda de árboles y palmeras. Retiro la basura verde al terminar.",
    experienceYears: 10,
    availableDays: WEEKDAYS_SAT,
  },
];

export const CLIENTS: SeedClient[] = [
  {
    key: "sofia",
    role: "client",
    name: "Sofía Avilés Green",
    email: email("sofia.aviles"),
    phone: "612 122 4498",
    city: "La Paz",
    colonia: "Centro",
    zip: "23000",
    lat: 24.1591,
    lon: -110.3108,
  },
  {
    key: "miguel",
    role: "client",
    name: "Miguel Ángel Ceseña",
    email: email("miguel.cesena"),
    phone: "624 135 0071",
    city: "San José del Cabo",
    colonia: "Chula Vista",
    zip: "23460",
    lat: 23.0561,
    lon: -109.7059,
  },
  {
    key: "valeria",
    role: "client",
    name: "Valeria Talamantes",
    email: email("valeria.talamantes"),
    phone: "624 166 3329",
    city: "Cabo San Lucas",
    colonia: "Lomas del Sol",
    zip: "23463",
    lat: 22.9098,
    lon: -109.9302,
  },
  {
    key: "roberto",
    role: "client",
    name: "Roberto Peralta Lucero",
    email: email("roberto.peralta"),
    phone: "612 181 7754",
    city: "La Paz",
    colonia: "Indeco",
    zip: "23070",
    lat: 24.1172,
    lon: -110.3068,
  },
  {
    key: "paola",
    role: "client",
    name: "Paola Geraldo Cota",
    email: email("paola.geraldo"),
    phone: "624 103 6612",
    city: "Cabo San Lucas",
    colonia: "Arcos del Sol",
    zip: "23455",
    lat: 22.9148,
    lon: -109.9118,
  },
];

export const USERS: SeedUser[] = [...PROVIDERS, ...CLIENTS];
