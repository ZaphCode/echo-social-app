import { describe, expect, test } from "bun:test";

import {
  getRequestProvider,
  getRequestSubject,
  isContractingRequest,
  mapContractingSubject,
  mapServiceSubject,
} from "../src/utils/negotiationSubject";
import type {
  ContractingWithOwner,
  ServiceRequestWithRelations,
  ServiceWithProvider,
} from "../src/api/types";
import type { User } from "../src/models/User";

const provider: User = {
  id: "provider-1",
  email: "provider@example.com",
  avatar: "avatar.jpg",
  name: "Proveedor Demo",
  role: "provider",
  email_visibility: true,
  verified: true,
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
};

const service: ServiceWithProvider = {
  id: "service-1",
  provider: provider.id,
  category: "cat-1",
  name: "Servicio de prueba",
  description: "Descripción del servicio",
  base_price: 800,
  photos: ["service.jpg"],
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
  provider_profile: provider,
};

const contracting: ContractingWithOwner = {
  id: "contracting-1",
  owner: "client-1",
  category: "cat-1",
  name: "Solicitud publicada",
  description: "Descripción de la solicitud",
  base_price: 1200,
  photos: [],
  is_closed: false,
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
  owner_profile: provider,
};

function makeRequest(
  overrides: Partial<ServiceRequestWithRelations> = {}
): ServiceRequestWithRelations {
  return {
    id: "request-1",
    client: "client-1",
    provider: provider.id,
    service: "service-1",
    contracting: null,
    last_offer_user: "client-1",
    agreed_price: 500,
    agreed_date: "2026-09-20",
    notes: "",
    agreement_state: "NEGOTIATION" as const,
    client_offer_status: "PENDING" as const,
    provider_offer_status: "PENDING" as const,
    requested: "2026-09-14T10:00:00.000Z",
    updated_at: "2026-09-14T10:00:00.000Z",
    client_profile: provider,
    provider_profile: provider,
    ...overrides,
  };
}

describe("sujeto visible de una negociación", () => {
  test("mapea un servicio con su proveedor", () => {
    expect(mapServiceSubject(service)).toEqual({
      id: "service-1",
      type: "service",
      name: "Servicio de prueba",
      description: "Descripción del servicio",
      base_price: 800,
      photos: ["service.jpg"],
      ownerId: "provider-1",
    });
  });

  test("mapea una contratación con su propietario", () => {
    expect(mapContractingSubject(contracting)).toMatchObject({
      id: "contracting-1",
      type: "contracting",
      ownerId: "client-1",
      base_price: 1200,
    });
  });

  test("prioriza el detalle de contratación cuando existe", () => {
    const subject = getRequestSubject(
      makeRequest({ contracting: contracting.id, contracting_detail: contracting })
    );

    expect(subject.type).toBe("contracting");
    expect(subject.id).toBe("contracting-1");
  });

  test("usa un fallback cuando no hay detalles relacionados", () => {
    const subject = getRequestSubject(
      makeRequest({ service: null, contracting: "contracting-2" })
    );

    expect(subject).toMatchObject({
      id: "contracting-2",
      type: "contracting",
      name: "Publicación",
      base_price: 500,
      ownerId: "client-1",
    });
  });

  test("obtiene el proveedor de la solicitud y reconoce contrataciones", () => {
    const request = makeRequest({ contracting: contracting.id, service: null });

    expect(getRequestProvider(request)).toBe(provider);
    expect(isContractingRequest(request)).toBe(true);
    expect(isContractingRequest(makeRequest())).toBe(false);
  });
});
