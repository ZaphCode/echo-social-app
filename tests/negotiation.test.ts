import { describe, expect, test } from "bun:test";

import {
  bothAgreed,
  bothMarkedCompleted,
  bothRejected,
  clientAgreed,
  clientMarkedCompleted,
  clientRejected,
  isAccepted,
  isCanceled,
  isFinished,
  isNegotiation,
  providerAgreed,
  providerMarkedCompleted,
  providerRejected,
} from "../src/utils/negotiation";
import type { ServiceRequest } from "../src/models/ServiceRequest";

function makeRequest(
  overrides: Partial<ServiceRequest> = {}
): ServiceRequest {
  return {
    id: "request-1",
    client: "client-1",
    provider: "provider-1",
    service: "service-1",
    contracting: null,
    last_offer_user: "client-1",
    agreed_price: 500,
    agreed_date: "2026-09-20",
    notes: "Trabajo de prueba",
    agreement_state: "NEGOTIATION",
    client_offer_status: "PENDING",
    provider_offer_status: "PENDING",
    requested: "2026-09-14T10:00:00.000Z",
    updated_at: "2026-09-14T10:00:00.000Z",
    ...overrides,
  };
}

describe("estados de una solicitud", () => {
  test("detecta cuando ambas partes aceptaron", () => {
    const request = makeRequest({
      client_offer_status: "ACCEPTED",
      provider_offer_status: "ACCEPTED",
    });

    expect(clientAgreed(request)).toBe(true);
    expect(providerAgreed(request)).toBe(true);
    expect(bothAgreed(request)).toBe(true);
  });

  test("distingue un rechazo parcial de un rechazo total", () => {
    const request = makeRequest({ client_offer_status: "REJECTED" });

    expect(clientRejected(request)).toBe(true);
    expect(providerRejected(request)).toBe(false);
    expect(bothRejected(request)).toBe(false);
  });

  test("detecta finalización de ambas partes", () => {
    const request = makeRequest({
      client_offer_status: "COMPLETED",
      provider_offer_status: "COMPLETED",
    });

    expect(clientMarkedCompleted(request)).toBe(true);
    expect(providerMarkedCompleted(request)).toBe(true);
    expect(bothMarkedCompleted(request)).toBe(true);
  });

  test.each([
    ["NEGOTIATION", isNegotiation],
    ["ACCEPTED", isAccepted],
    ["CANCELED", isCanceled],
    ["FINISHED", isFinished],
  ] as const)("reconoce el estado %s", (state, matcher) => {
    expect(matcher(makeRequest({ agreement_state: state }))).toBe(true);
  });
});
