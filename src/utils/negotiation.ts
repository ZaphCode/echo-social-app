import { ServiceRequest } from "@/models/ServiceRequest";

export function bothAgreed(request: ServiceRequest): boolean {
  return (
    request.client_offer_status === "ACCEPTED" &&
    request.provider_offer_status === "ACCEPTED"
  );
}

export function clientAgreed(request: ServiceRequest): boolean {
  return request.client_offer_status === "ACCEPTED";
}

export function providerAgreed(request: ServiceRequest): boolean {
  return request.provider_offer_status === "ACCEPTED";
}

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
