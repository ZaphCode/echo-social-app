import { supabase } from "@/lib/supabase";
import { ServiceRequest } from "@/models/ServiceRequest";
import { isAuthError, throwIfError } from "./common";
import { ServiceRequestWithRelations } from "./types";
import { getOfflineNetworkState, isLikelyNetworkError } from "@/offline/network";
import { createLocalUuid } from "@/offline/ids";
import {
  cacheServiceRequests,
  enqueueOfflineMutation,
  getCachedContracting,
  getCachedProfile,
  getCachedService,
  getCachedServiceRequest,
  listCachedServiceRequestsForContractingProvider,
  listCachedServiceRequestsForServiceClient,
  listCachedServiceRequestsForUser,
} from "@/offline/store";

export const serviceRequestSelect =
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
  if (!getOfflineNetworkState()) {
    return listCachedServiceRequestsForUser(clientId);
  }

  if (!(await hasRemoteSessionForUser(clientId))) {
    return listCachedServiceRequestsForUser(clientId);
  }

  try {
    const { data, error } = await supabase
      .from("service_request")
      .select(serviceRequestSelect)
      .eq("client", clientId)
      .order("updated_at", { ascending: false });

    throwIfError(error);

    const requests = (data ?? []) as ServiceRequestWithRelations[];
    await cacheServiceRequests(clientId, requests);

    return requests;
  } catch (error) {
    if (isLikelyNetworkError(error) || isAuthError(error)) {
      return listCachedServiceRequestsForUser(clientId);
    }

    throw error;
  }
}

export async function listAllUserRequests(userId: string) {
  if (!getOfflineNetworkState()) {
    return listCachedServiceRequestsForUser(userId);
  }

  if (!(await hasRemoteSessionForUser(userId))) {
    return listCachedServiceRequestsForUser(userId);
  }

  try {
    const { data, error } = await supabase
      .from("service_request")
      .select(serviceRequestSelect)
      .or(`client.eq.${userId},provider.eq.${userId}`)
      .order("updated_at", { ascending: false });

    throwIfError(error);

    const requests = (data ?? []) as ServiceRequestWithRelations[];
    await cacheServiceRequests(userId, requests);

    return requests;
  } catch (error) {
    if (isLikelyNetworkError(error) || isAuthError(error)) {
      return listCachedServiceRequestsForUser(userId);
    }

    throw error;
  }
}

export async function listServiceRequestsForClient(
  serviceId: string,
  clientId: string
) {
  if (!getOfflineNetworkState()) {
    return listCachedServiceRequestsForServiceClient(serviceId, clientId);
  }

  if (!(await hasRemoteSessionForUser(clientId))) {
    return listCachedServiceRequestsForServiceClient(serviceId, clientId);
  }

  try {
    const { data, error } = await supabase
      .from("service_request")
      .select(serviceRequestSelect)
      .eq("service", serviceId)
      .eq("client", clientId);

    throwIfError(error);

    const requests = (data ?? []) as ServiceRequestWithRelations[];
    await cacheServiceRequests(clientId, requests);

    return requests;
  } catch (error) {
    if (isLikelyNetworkError(error) || isAuthError(error)) {
      return listCachedServiceRequestsForServiceClient(serviceId, clientId);
    }

    throw error;
  }
}

export async function listContractingApplicationsForProvider(
  contractingId: string,
  providerId: string
) {
  if (!getOfflineNetworkState()) {
    return listCachedServiceRequestsForContractingProvider(
      contractingId,
      providerId
    );
  }

  if (!(await hasRemoteSessionForUser(providerId))) {
    return listCachedServiceRequestsForContractingProvider(
      contractingId,
      providerId
    );
  }

  try {
    const { data, error } = await supabase
      .from("service_request")
      .select(serviceRequestSelect)
      .eq("contracting", contractingId)
      .eq("provider", providerId);

    throwIfError(error);

    const requests = (data ?? []) as ServiceRequestWithRelations[];
    await cacheServiceRequests(providerId, requests);

    return requests;
  } catch (error) {
    if (isLikelyNetworkError(error) || isAuthError(error)) {
      return listCachedServiceRequestsForContractingProvider(
        contractingId,
        providerId
      );
    }

    throw error;
  }
}

export async function getServiceRequestById(requestId: string) {
  if (!getOfflineNetworkState()) {
    const cached = await getCachedServiceRequest(requestId);
    if (cached) return cached;
  }

  try {
    const { data, error } = await supabase
      .from("service_request")
      .select(serviceRequestSelect)
      .eq("id", requestId)
      .single();

    throwIfError(error);

    const request = data as ServiceRequestWithRelations;
    await cacheServiceRequests(request.client, [request]);
    await cacheServiceRequests(request.provider, [request]);

    return request;
  } catch (error) {
    const cached = await getCachedServiceRequest(requestId);
    if (cached) return cached;

    throw error;
  }
}

export async function createServiceRequest(input: CreateServiceRequestInput) {
  const id = createLocalUuid();
  const payload = {
    id,
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

  if (!getOfflineNetworkState()) {
    const offlineRequest = await buildOfflineCreatedRequest(input, id);
    await cacheServiceRequests(input.lastOfferUserId, [offlineRequest], {
      dirtyStatus: "pending",
      baseUpdatedAt: offlineRequest.updated_at,
    });
    await cacheServiceRequests(
      input.lastOfferUserId === input.clientId ? input.providerId : input.clientId,
      [offlineRequest],
      {
        dirtyStatus: "pending",
        baseUpdatedAt: offlineRequest.updated_at,
      }
    );
    await enqueueOfflineMutation({
      entityType: "service_request",
      entityId: id,
      action: "service_request_create",
      payload,
      baseUpdatedAt: offlineRequest.updated_at,
    });

    return offlineRequest;
  }

  try {
    const { data, error } = await supabase
      .from("service_request")
      .insert(payload)
      .select(serviceRequestSelect)
      .single();

    throwIfError(error);

    const request = data as ServiceRequestWithRelations;
    await cacheServiceRequests(request.client, [request]);
    await cacheServiceRequests(request.provider, [request]);

    return request;
  } catch (error) {
    if (!isLikelyNetworkError(error)) throw error;

    const offlineRequest = await buildOfflineCreatedRequest(input, id);
    await cacheServiceRequests(input.lastOfferUserId, [offlineRequest], {
      dirtyStatus: "pending",
      baseUpdatedAt: offlineRequest.updated_at,
    });
    await cacheServiceRequests(
      input.lastOfferUserId === input.clientId ? input.providerId : input.clientId,
      [offlineRequest],
      {
        dirtyStatus: "pending",
        baseUpdatedAt: offlineRequest.updated_at,
      }
    );
    await enqueueOfflineMutation({
      entityType: "service_request",
      entityId: id,
      action: "service_request_create",
      payload,
      baseUpdatedAt: offlineRequest.updated_at,
    });

    return offlineRequest;
  }
}

export async function updateServiceRequest(
  requestId: string,
  patch: UpdateServiceRequestInput,
  actorUserId?: string
) {
  const cachedRequest = await getCachedServiceRequest(requestId);
  if (
    cachedRequest &&
    actorUserId &&
    cachedRequest.client !== actorUserId &&
    cachedRequest.provider !== actorUserId
  ) {
    throw new Error("Esta solicitud no pertenece al usuario autenticado.");
  }

  if (!getOfflineNetworkState()) {
    if (!cachedRequest) {
      throw new Error("No hay una copia local de esta solicitud.");
    }

    const updatedRequest = {
      ...cachedRequest,
      ...patch,
      updated_at: new Date().toISOString(),
    } as ServiceRequestWithRelations;

    await cacheServiceRequests(cachedRequest.client, [updatedRequest], {
      dirtyStatus: "pending",
      baseUpdatedAt: cachedRequest.updated_at,
    });
    await cacheServiceRequests(cachedRequest.provider, [updatedRequest], {
      dirtyStatus: "pending",
      baseUpdatedAt: cachedRequest.updated_at,
    });
    await enqueueOfflineMutation({
      entityType: "service_request",
      entityId: requestId,
      action: "service_request_update",
      payload: patch,
      baseUpdatedAt: cachedRequest.updated_at,
    });

    return updatedRequest;
  }

  try {
    const { data, error } = await supabase
      .from("service_request")
      .update(patch)
      .eq("id", requestId)
      .select(serviceRequestSelect)
      .single();

    throwIfError(error);

    const request = data as ServiceRequestWithRelations;
    await cacheServiceRequests(request.client, [request]);
    await cacheServiceRequests(request.provider, [request]);

    return request;
  } catch (error) {
    if (!isLikelyNetworkError(error) || !cachedRequest) throw error;

    const updatedRequest = {
      ...cachedRequest,
      ...patch,
      updated_at: new Date().toISOString(),
    } as ServiceRequestWithRelations;

    await cacheServiceRequests(cachedRequest.client, [updatedRequest], {
      dirtyStatus: "pending",
      baseUpdatedAt: cachedRequest.updated_at,
    });
    await cacheServiceRequests(cachedRequest.provider, [updatedRequest], {
      dirtyStatus: "pending",
      baseUpdatedAt: cachedRequest.updated_at,
    });
    await enqueueOfflineMutation({
      entityType: "service_request",
      entityId: requestId,
      action: "service_request_update",
      payload: patch,
      baseUpdatedAt: cachedRequest.updated_at,
    });

    return updatedRequest;
  }
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
  if (!getOfflineNetworkState()) {
    const requests = await listCachedServiceRequestsForUser(userId);
    return requests.filter((request) => request.agreement_state === "FINISHED");
  }

  if (!(await hasRemoteSessionForUser(userId))) {
    const requests = await listCachedServiceRequestsForUser(userId);
    return requests.filter((request) => request.agreement_state === "FINISHED");
  }

  const { data, error } = await supabase
    .from("service_request")
    .select(serviceRequestSelect)
    .eq("agreement_state", "FINISHED")
    .or(`client.eq.${userId},provider.eq.${userId}`);

  throwIfError(error);

  const requests = (data ?? []) as ServiceRequestWithRelations[];
  await cacheServiceRequests(userId, requests);

  return requests;
}

async function hasRemoteSessionForUser(userId: string) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.user.id === userId;
}

function createFallbackProfile(id: string): ServiceRequestWithRelations["client_profile"] {
  return {
    id,
    email: "",
    name: "Usuario",
    role: "client",
    created_at: "",
    updated_at: "",
    avatar: "",
    email_visibility: false,
    verified: false,
  };
}

async function buildOfflineCreatedRequest(
  input: CreateServiceRequestInput,
  id: string
) {
  const timestamp = new Date().toISOString();
  const service = input.serviceId
    ? await getCachedService(input.serviceId)
    : null;
  const contracting = input.contractingId
    ? await getCachedContracting(input.contractingId)
    : null;
  const client =
    (await getCachedProfile(input.clientId)) ?? createFallbackProfile(input.clientId);
  const provider =
    (await getCachedProfile(input.providerId)) ??
    service?.provider_profile ??
    createFallbackProfile(input.providerId);

  return {
    id,
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
    requested: timestamp,
    updated_at: timestamp,
    service_detail: service,
    contracting_detail: contracting,
    client_profile: client,
    provider_profile: provider,
  } satisfies ServiceRequestWithRelations;
}
