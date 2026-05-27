import { supabase } from "@/lib/supabase";
import { Service } from "@/models/Service";
import { throwIfError } from "./common";
import { uploadServiceImages } from "./storage";
import {
  ServiceWithProvider,
  ServiceWithProviderAndCategory,
} from "./types";
import { getOfflineNetworkState, isLikelyNetworkError } from "@/offline/network";
import {
  cacheServices,
  listCachedServicesByCategory,
  markServiceVisited,
  searchCachedServices,
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

  return data as ServiceWithProvider;
}

export async function updateService(serviceId: string, input: SaveServiceInput) {
  const photos = await uploadServiceImages(input.providerId, input.photos);

  const payload: Partial<Service> = {
    name: input.name,
    description: input.description,
    category: input.category,
    base_price: input.basePrice,
    photos,
  };

  const { data, error } = await supabase
    .from("service")
    .update(payload)
    .eq("id", serviceId)
    .select(serviceCardSelect)
    .single();

  throwIfError(error);

  return data as ServiceWithProvider;
}
