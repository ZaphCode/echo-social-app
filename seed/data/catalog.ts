/**
 * Services (published by providers) and contrataciones (published by
 * clients). `folder` is the directory under seed/images/<services|contractings>.
 * `category` must match a service_category.name.
 */

export type SeedService = {
  key: string;
  provider: string; // SeedUser.key
  folder: string;
  category: string;
  name: string;
  description: string;
  basePrice: number;
};

export type SeedContracting = {
  key: string;
  owner: string; // SeedUser.key
  folder: string;
  category: string;
  name: string;
  description: string;
  basePrice: number;
  /** Exact point of the job; defaults to the owner's location. */
  lat?: number;
  lon?: number;
  /** Days ago it was published (spreads them out in "recientes"). */
  daysAgo: number;
};

export const SERVICES: SeedService[] = [
  {
    key: "colado-losa",
    provider: "ramon",
    folder: "slab-pouring",
    category: "Albañilería",
    name: "Colado de losa",
    description:
      "Colado de losas de entrepiso, azotea y cimentación con concreto premezclado o hecho en obra. Incluye cimbra, armado y vibrado. Precio por m², material aparte.",
    basePrice: 350,
  },
  {
    key: "construccion-cuartos",
    provider: "ramon",
    folder: "room-construction",
    category: "Albañilería",
    name: "Construcción y ampliación de cuartos",
    description:
      "Construcción de recámaras, baños y cuartos de servicio en block, desde cimentación hasta enjarre. Presupuesto sin costo; precio base por m² de mano de obra.",
    basePrice: 2800,
  },
  {
    key: "instalacion-pisos",
    provider: "javier",
    folder: "floor-installation",
    category: "Instalación de Pisos",
    name: "Instalación de pisos cerámicos y porcelanato",
    description:
      "Colocación de piso cerámico, porcelanato y vitropiso con adhesivo de calidad, nivelación y boquilla. Precio por m² de mano de obra.",
    basePrice: 180,
  },
  {
    key: "instalacion-azulejos",
    provider: "javier",
    folder: "tile-installation",
    category: "Instalación de Pisos",
    name: "Instalación de azulejo en baños y cocinas",
    description:
      "Recubrimiento de muros de regadera, cocina y fachadas con azulejo o mosaico. Cortes a 45°, esquineros y sellado. Precio por m².",
    basePrice: 220,
  },
  {
    key: "limpieza-casas",
    provider: "adriana",
    folder: "house-cleaning",
    category: "Limpieza de Casas y Oficinas",
    name: "Limpieza de casas y departamentos",
    description:
      "Limpieza general o profunda: cocina, baños, pisos, ventanas y recámaras. Ideal para entrega de rentas vacacionales. Precio por visita de hasta 3 recámaras.",
    basePrice: 650,
  },
  {
    key: "instalacion-ac",
    provider: "luis",
    folder: "ac-installation",
    category: "Instalación de Aires Acondicionados",
    name: "Instalación de minisplit",
    description:
      "Instalación de minisplit de 1 a 2 toneladas con hasta 4 m de tubería, base, vacío y prueba de funcionamiento. Garantía de 6 meses en mano de obra.",
    basePrice: 2500,
  },
  {
    key: "recarga-gas-ac",
    provider: "luis",
    folder: "ac-gas-recharge",
    category: "Instalación de Aires Acondicionados",
    name: "Recarga de gas para aire acondicionado",
    description:
      "Detección de fugas y recarga de gas R410A o R32 para minisplit. Incluye revisión de presiones y amperaje.",
    basePrice: 900,
  },
  {
    key: "limpieza-ac",
    provider: "hector",
    folder: "ac-cleaning",
    category: "Instalación de Aires Acondicionados",
    name: "Limpieza y mantenimiento de minisplit",
    description:
      "Lavado profundo de evaporador y condensador, limpieza de filtros, charola y drenaje. Recomendado cada 6 meses por la salinidad de La Paz.",
    basePrice: 550,
  },
  {
    key: "reparacion-fugas",
    provider: "daniel",
    folder: "leak-repair",
    category: "Plomería",
    name: "Detección y reparación de fugas",
    description:
      "Localizo fugas ocultas en muros y pisos con detector, reparo tubería de cobre, CPVC o PVC y dejo el área resanada. Precio base por visita y diagnóstico.",
    basePrice: 450,
  },
  {
    key: "centro-carga",
    provider: "carlos",
    folder: "breaker-panel-organization",
    category: "Electricista",
    name: "Ordenamiento de centro de carga",
    description:
      "Peinado y etiquetado de circuitos, balanceo de cargas, cambio de pastillas termomagnéticas e instalación de tierra física.",
    basePrice: 1200,
  },
  {
    key: "instalacion-lamparas",
    provider: "carlos",
    folder: "light-fixture-installation",
    category: "Electricista",
    name: "Instalación de lámparas y luminarias",
    description:
      "Instalación de lámparas colgantes, plafones LED, ventiladores de techo y luminarias exteriores. Precio por pieza.",
    basePrice: 350,
  },
  {
    key: "decoracion-jardin",
    provider: "marisol",
    folder: "garden-decoration",
    category: "Jardinería",
    name: "Decoración y diseño de jardines",
    description:
      "Diseño de jardines y macetas con plantas de temporada y nativas de Baja California Sur. Incluye propuesta, sustrato y plantación.",
    basePrice: 1500,
  },
  {
    key: "poda-pasto",
    provider: "joel",
    folder: "lawn-mowing",
    category: "Jardinería",
    name: "Poda de pasto y limpieza de jardín",
    description:
      "Corte de pasto con podadora y desbrozadora, orillado, barrido y retiro de basura verde. Precio para jardines de hasta 100 m².",
    basePrice: 400,
  },
];

export const CONTRACTINGS: SeedContracting[] = [
  {
    key: "pintura-humedad",
    owner: "sofia",
    folder: "damp-wall-painting",
    category: "Pintura",
    name: "Pintura en muro con humedad",
    description:
      "Tengo una pared de la sala con salitre y pintura descarapelada por humedad. Busco a alguien que la trate con impermeabilizante y la pinte de nuevo. Son aprox. 12 m².",
    basePrice: 1800,
    daysAgo: 2,
  },
  {
    key: "limpieza-tinacos",
    owner: "miguel",
    folder: "water-tank-cleaning",
    category: "Limpieza de Fosas y Biodigestores",
    name: "Limpieza de mis tinacos",
    description:
      "Necesito lavar y desinfectar dos tinacos de 1,100 L que tienen sarro y sedimento. Están en la azotea, con acceso por escalera.",
    basePrice: 900,
    daysAgo: 1,
  },
  {
    key: "ac-no-enfria",
    owner: "valeria",
    folder: "ac-not-cooling",
    category: "Instalación de Aires Acondicionados",
    name: "Mi aire acondicionado no enfría",
    description:
      "Minisplit de 1.5 toneladas en la recámara principal: prende y sopla pero el aire sale tibio. Creo que le falta gas. Urgente por el calor.",
    basePrice: 1200,
    daysAgo: 0,
  },
  {
    key: "cambio-contacto",
    owner: "roberto",
    folder: "outlet-replacement",
    category: "Electricista",
    name: "Cambio de contacto eléctrico quemado",
    description:
      "Un contacto de la recámara se quemó y ennegreció la placa. Necesito cambiarlo y revisar que el cableado no esté dañado.",
    basePrice: 500,
    daysAgo: 3,
  },
];
