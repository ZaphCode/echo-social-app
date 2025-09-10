import { ServiceRequest } from "@/models/ServiceRequest";

// Agreed status
export function clientAgreed(request: ServiceRequest): boolean {
  return request.client_offer_status === "ACCEPTED";
}

export function providerAgreed(request: ServiceRequest): boolean {
  return request.provider_offer_status === "ACCEPTED";
}

export function bothAgreed(request: ServiceRequest): boolean {
  return (
    request.client_offer_status === "ACCEPTED" &&
    request.provider_offer_status === "ACCEPTED"
  );
}

// Rejected status
export function clientRejected(request: ServiceRequest): boolean {
  return request.client_offer_status === "REJECTED";
}

export function providerRejected(request: ServiceRequest): boolean {
  return request.provider_offer_status === "REJECTED";
}

export function bothRejected(request: ServiceRequest): boolean {
  return (
    request.client_offer_status === "REJECTED" &&
    request.provider_offer_status === "REJECTED"
  );
}

// Finish status
export function clientMarkedCompleted(request: ServiceRequest): boolean {
  return request.client_offer_status === "COMPLETED";
}

export function providerMarkedCompleted(request: ServiceRequest): boolean {
  return request.provider_offer_status === "COMPLETED";
}

export function bothMarkedCompleted(request: ServiceRequest): boolean {
  return (
    request.client_offer_status === "COMPLETED" &&
    request.provider_offer_status === "COMPLETED"
  );
}

// Request status
export function isNegotiation(request: ServiceRequest): boolean {
  return request.agreement_state === "NEGOTIATION";
}

export function isAccepted(request: ServiceRequest): boolean {
  return request.agreement_state === "ACCEPTED";
}

export function isCanceled(request: ServiceRequest): boolean {
  return request.agreement_state === "CANCELED";
}

export function isFinished(request: ServiceRequest): boolean {
  return request.agreement_state === "FINISHED";
}
