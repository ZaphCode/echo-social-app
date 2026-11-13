/**
 * Demo activity: finished jobs (with two-way reviews) and open negotiations.
 * No chat messages are seeded.
 */

export type FinishedJob = {
  client: string; // SeedUser.key
  service: string; // SeedService.key
  agreedPrice: number;
  daysAgo: number;
  notes: string;
  /** Review the client leaves for the provider. */
  clientReview: { rating: number; comment: string };
  /** Review the provider leaves for the client. */
  providerReview: { rating: number; comment: string };
};

export type OpenNegotiation =
  | {
      kind: "service";
      client: string;
      service: string; // SeedService.key
      offer: number;
      inDays: number;
      notes: string;
    }
  | {
      kind: "contracting";
      provider: string;
      contracting: string; // SeedContracting.key
      offer: number;
      inDays: number;
      notes: string;
    };

export const FINISHED_JOBS: FinishedJob[] = [
  {
    client: "paola",
    service: "limpieza-casas",
    agreedPrice: 700,
    daysAgo: 20,
    notes: "Limpieza profunda antes de recibir huéspedes.",
    clientReview: {
      rating: 5,
      comment: "Súper detallista, dejó la casa impecable y llegó puntual.",
    },
    providerReview: {
      rating: 5,
      comment: "Muy amable y clara con lo que necesitaba. ¡Gracias!",
    },
  },
  {
    client: "roberto",
    service: "reparacion-fugas",
    agreedPrice: 850,
    daysAgo: 15,
    notes: "Fuga en la tubería del baño, se mancha el muro del pasillo.",
    clientReview: {
      rating: 4,
      comment: "Encontró la fuga rápido. Tardó un poco en el resane, pero quedó bien.",
    },
    providerReview: {
      rating: 5,
      comment: "Cliente atento, tenía todo despejado para trabajar.",
    },
  },
  {
    client: "sofia",
    service: "decoracion-jardin",
    agreedPrice: 1800,
    daysAgo: 12,
    notes: "Macetas para el patio y la entrada.",
    clientReview: {
      rating: 5,
      comment: "Me encantó la propuesta, las plantas aguantan bien el sol.",
    },
    providerReview: {
      rating: 4,
      comment: "Todo bien, solo hubo que reprogramar una vez.",
    },
  },
  {
    client: "miguel",
    service: "poda-pasto",
    agreedPrice: 450,
    daysAgo: 8,
    notes: "Jardín de enfrente y el patio trasero.",
    clientReview: {
      rating: 5,
      comment: "Rápido y se llevó toda la basura. Lo vuelvo a contratar.",
    },
    providerReview: {
      rating: 5,
      comment: "Excelente cliente, pago puntual.",
    },
  },
  {
    client: "valeria",
    service: "limpieza-ac",
    agreedPrice: 550,
    daysAgo: 30,
    notes: "Mantenimiento de dos minisplits.",
    clientReview: {
      rating: 4,
      comment: "Buen trabajo, los equipos quedaron limpios.",
    },
    providerReview: {
      rating: 5,
      comment: "Muy buena comunicación, recomendada.",
    },
  },
];

export const OPEN_NEGOTIATIONS: OpenNegotiation[] = [
  {
    kind: "contracting",
    provider: "luis",
    contracting: "ac-no-enfria",
    offer: 1100,
    inDays: 1,
    notes: "Puedo ir mañana a revisar presiones y recargar si es necesario.",
  },
  {
    kind: "contracting",
    provider: "carlos",
    contracting: "cambio-contacto",
    offer: 450,
    inDays: 2,
    notes: "Incluye contacto nuevo con placa y revisión del circuito.",
  },
  {
    kind: "service",
    client: "paola",
    service: "instalacion-pisos",
    offer: 160,
    inDays: 7,
    notes: "Son unos 35 m² de sala y comedor, ya tengo el porcelanato.",
  },
];
