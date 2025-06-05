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
