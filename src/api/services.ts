import { supabase } from "@/lib/supabase";
import { Service } from "@/models/Service";
import { isAuthError, throwIfError } from "./common";
import { uploadServiceImages } from "./storage";
import {
  ServiceWithProvider,
  ServiceWithProviderAndCategory,
} from "./types";
import { getOfflineNetworkState, isLikelyNetworkError } from "@/offline/network";
import {
  cacheServices,
  enqueueOfflineMutation,
  getCachedService,
  listCachedServicesByCategory,
  markServiceVisited,
  searchCachedServices,
  updateCachedService,
} from "@/offline/store";

const serviceCardSelect = "*, provider_profile:profiles!provider(*)";
const serviceSearchSelect =
  "*, provider_profile:profiles!provider(*), category_detail:service_category!category(*)";

export const servicesKeys = {
  all: ["services"] as const,
  byCategory: (categoryId: string) =>
    ["services", "category", categoryId] as const,
  search: (query: string) => ["services", "search", query] as const,
  detail: (serviceId: string) => ["services", "detail", serviceId] as const,
};

export type SaveServiceInput = {
  providerId: string;
  name: string;
  description: string;
  category: string;
  basePrice: number;
  photos: string[];
};

export async function listServicesByCategory(categoryId: string) {
  if (!getOfflineNetworkState()) {
    return listCachedServicesByCategory(categoryId);
  }

  try {
    let query = supabase.from("service").select(serviceCardSelect);

    if (categoryId !== "all") {
      query = query.eq("category", categoryId);
    }

    const { data, error } = await query;

    throwIfError(error);

    const services = (data ?? []) as ServiceWithProvider[];
    await cacheServices(services);

    return services;
  } catch (error) {
    if (isLikelyNetworkError(error)) {
      return listCachedServicesByCategory(categoryId);
    }

    throw error;
  }
}

export async function searchServices(search: string) {
  if (!getOfflineNetworkState()) {
    return searchCachedServices(search);
  }

  const normalizedSearch = search.trim();
  try {
    const { data, error } = await supabase
      .from("service")
      .select(serviceSearchSelect)
      .or(
        `name.ilike.%${normalizedSearch}%,description.ilike.%${normalizedSearch}%`
      );

    throwIfError(error);

    const services = (data ?? []) as ServiceWithProviderAndCategory[];
    await cacheServices(services);

    return services;
  } catch (error) {
    if (isLikelyNetworkError(error)) {
      return searchCachedServices(search);
    }

    throw error;
  }
}

export async function cacheVisitedService(service: ServiceWithProvider) {
  await markServiceVisited(service);
}

export async function createService(input: SaveServiceInput) {
  const photos = await uploadServiceImages(input.providerId, input.photos);

  const payload = {
    provider: input.providerId,
    name: input.name,
    description: input.description,
    category: input.category,
    base_price: input.basePrice,
    photos,
  };

  const { data, error } = await supabase
    .from("service")
    .insert(payload)
    .select(serviceCardSelect)
    .single();

  throwIfError(error);

  const service = data as ServiceWithProvider;
  await cacheServices([service]);

  return service;
}

export async function updateService(serviceId: string, input: SaveServiceInput) {
  const payload: Partial<Service> = {
    name: input.name,
    description: input.description,
    category: input.category,
    base_price: input.basePrice,
    photos: input.photos,
  };

  const cached = await getCachedService(serviceId);

  if (!getOfflineNetworkState()) {
    return updateServiceLocally(serviceId, input, payload, cached);
  }

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user.id !== input.providerId) {
      return updateServiceLocally(serviceId, input, payload, cached);
    }

    const photos = await uploadServiceImages(input.providerId, input.photos);
    const remotePayload = { ...payload, photos };
    const { data, error } = await supabase
      .from("service")
      .update(remotePayload)
      .eq("id", serviceId)
      .select(serviceCardSelect)
      .single();

    throwIfError(error);

    const service = data as ServiceWithProvider;
    await cacheServices([service], { visited: true });

    return service;
  } catch (error) {
    if (isLikelyNetworkError(error) || isAuthError(error)) {
      return updateServiceLocally(serviceId, input, payload, cached);
    }

    throw error;
  }
}

async function updateServiceLocally(
  serviceId: string,
  input: SaveServiceInput,
  payload: Partial<Service>,
  cached?: ServiceWithProvider | null
) {
  const current = cached ?? await getCachedService(serviceId);
  if (!current) {
    throw new Error("No se encontró el servicio local para editar offline.");
  }

  if (current.provider !== input.providerId) {
    throw new Error("No puedes editar un servicio de otro usuario.");
  }

  const updated = await updateCachedService(serviceId, payload, input.providerId);
  if (!updated) {
    throw new Error("No se pudo guardar el servicio localmente.");
  }

  await enqueueOfflineMutation({
    entityType: "service",
    entityId: serviceId,
    action: "service_update",
    payload: {
      serviceId,
      actorUserId: input.providerId,
      input,
    },
    baseUpdatedAt: current.updated_at,
  });

  return updated;
}
