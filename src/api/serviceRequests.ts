import { supabase } from "@/lib/supabase";
import { ServiceRequest } from "@/models/ServiceRequest";
import { throwIfError } from "./common";
import { ServiceRequestWithRelations } from "./types";

const serviceRequestSelect =
  "*, service_detail:service!service(*, provider_profile:profiles!provider(*)), contracting_detail:contracting!contracting(*, owner_profile:profiles!owner(*)), client_profile:profiles!client(*), provider_profile:profiles!provider(*)";

export const serviceRequestsKeys = {
  all: ["serviceRequests"] as const,
  byClient: (clientId: string) => ["serviceRequests", "client", clientId] as const,
  allForUser: (userId: string) => ["serviceRequests", "user", userId] as const,
  byServiceAndClient: (serviceId: string, clientId: string) =>
    ["serviceRequests", "service", serviceId, "client", clientId] as const,
  byContractingAndProvider: (contractingId: string, providerId: string) =>
    ["serviceRequests", "contracting", contractingId, "provider", providerId] as const,
  finishedForUser: (userId: string) =>
    ["serviceRequests", "finished", userId] as const,
  detail: (requestId: string) => ["serviceRequests", "detail", requestId] as const,
};

export type CreateServiceRequestInput = {
  serviceId?: string;
  contractingId?: string;
  clientId: string;
  providerId: string;
  lastOfferUserId: string;
  agreedPrice: number;
  agreedDate: string;
  notes: string;
};

export type UpdateServiceRequestInput = Partial<
  Pick<
    ServiceRequest,
    | "agreed_price"
    | "agreed_date"
    | "notes"
    | "agreement_state"
    | "client_offer_status"
    | "provider_offer_status"
    | "last_offer_user"
    | "finished"
    | "canceled"
  >
>;

export async function listClientRequests(clientId: string) {
  const { data, error } = await supabase
    .from("service_request")
    .select(serviceRequestSelect)
    .eq("client", clientId)
    .order("updated_at", { ascending: false });

  throwIfError(error);

  return (data ?? []) as ServiceRequestWithRelations[];
}

export async function listAllUserRequests(userId: string) {
  const { data, error } = await supabase
    .from("service_request")
    .select(serviceRequestSelect)
    .or(`client.eq.${userId},provider.eq.${userId}`)
    .order("updated_at", { ascending: false });

  throwIfError(error);

  return (data ?? []) as ServiceRequestWithRelations[];
}

export async function listServiceRequestsForClient(
  serviceId: string,
  clientId: string
) {
  const { data, error } = await supabase
    .from("service_request")
    .select(serviceRequestSelect)
    .eq("service", serviceId)
    .eq("client", clientId);

  throwIfError(error);

  return (data ?? []) as ServiceRequestWithRelations[];
}

export async function listContractingApplicationsForProvider(
  contractingId: string,
  providerId: string
) {
  const { data, error } = await supabase
    .from("service_request")
    .select(serviceRequestSelect)
    .eq("contracting", contractingId)
    .eq("provider", providerId);

  throwIfError(error);

  return (data ?? []) as ServiceRequestWithRelations[];
}

export async function getServiceRequestById(requestId: string) {
  const { data, error } = await supabase
    .from("service_request")
    .select(serviceRequestSelect)
    .eq("id", requestId)
    .single();

  throwIfError(error);

  return data as ServiceRequestWithRelations;
}

export async function createServiceRequest(input: CreateServiceRequestInput) {
  const payload = {
    service: input.serviceId ?? null,
    contracting: input.contractingId ?? null,
    client: input.clientId,
    provider: input.providerId,
    last_offer_user: input.lastOfferUserId,
    agreed_price: input.agreedPrice,
    agreed_date: input.agreedDate,
    notes: input.notes,
    agreement_state: "NEGOTIATION" as const,
    client_offer_status: "PENDING" as const,
    provider_offer_status: "PENDING" as const,
  };

  const { data, error } = await supabase
    .from("service_request")
    .insert(payload)
    .select(serviceRequestSelect)
    .single();

  throwIfError(error);

  return data as ServiceRequestWithRelations;
}

export async function updateServiceRequest(
  requestId: string,
  patch: UpdateServiceRequestInput
) {
  const { data, error } = await supabase
    .from("service_request")
    .update(patch)
    .eq("id", requestId)
    .select(serviceRequestSelect)
    .single();

  throwIfError(error);

  return data as ServiceRequestWithRelations;
}

export async function finalizeRequestCompletion(requestId: string) {
  const { data, error } = await supabase.rpc("finalize_request_completion", {
    request_id: requestId,
  });

  throwIfError(error);

  return data as {
    did_increment_jobs: boolean;
    did_close_contracting: boolean;
    contracting_id?: string | null;
  };
}

export async function listFinishedRequestsForUser(userId: string) {
  const { data, error } = await supabase
    .from("service_request")
    .select(serviceRequestSelect)
    .eq("agreement_state", "FINISHED")
    .or(`client.eq.${userId},provider.eq.${userId}`);

  throwIfError(error);

  return (data ?? []) as ServiceRequestWithRelations[];
}
