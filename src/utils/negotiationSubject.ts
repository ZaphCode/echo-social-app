import { ContractingWithOwner, ServiceRequestWithRelations } from "@/api/types";
import { ServiceWithProvider } from "@/api/types";
import { ServiceRequest } from "@/models/ServiceRequest";
import { User } from "@/models/User";

export type NegotiationSubjectType = "service" | "contracting";

export type NegotiationSubject = {
  id: string;
  type: NegotiationSubjectType;
  name: string;
  description: string;
  base_price: number;
  photos: string[];
  ownerId: string;
};

export function getRequestSubject(
  request: ServiceRequestWithRelations
): NegotiationSubject {
  if (request.contracting_detail) {
    return mapContractingSubject(request.contracting_detail);
  }

  if (request.service_detail) {
    return mapServiceSubject(request.service_detail);
  }

  return {
    id: request.contracting ?? request.service ?? request.id,
    type: request.contracting ? "contracting" : "service",
    name: "Publicación",
    description: "",
    base_price: request.agreed_price,
    photos: [],
    ownerId: request.client,
  };
}

export function mapServiceSubject(service: ServiceWithProvider): NegotiationSubject {
  return {
    id: service.id,
    type: "service",
    name: service.name,
    description: service.description,
    base_price: service.base_price,
    photos: service.photos,
    ownerId: service.provider,
  };
}

export function mapContractingSubject(
  contracting: ContractingWithOwner
): NegotiationSubject {
  return {
    id: contracting.id,
    type: "contracting",
    name: contracting.name,
    description: contracting.description,
    base_price: contracting.base_price,
    photos: contracting.photos,
    ownerId: contracting.owner,
  };
}

export function getRequestProvider(request: ServiceRequestWithRelations): User {
  if (request.provider_profile) {
    return request.provider_profile;
  }

  return request.service_detail?.provider_profile ?? ({} as User);
}

export function isContractingRequest(request: ServiceRequest) {
  return !!request.contracting && !request.service;
}
