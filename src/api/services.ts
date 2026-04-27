import { supabase } from "@/lib/supabase";
import { Service } from "@/models/Service";
import { throwIfError } from "./common";
import { uploadServiceImages } from "./storage";
import {
  ServiceWithProvider,
  ServiceWithProviderAndCategory,
} from "./types";

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
  let query = supabase.from("service").select(serviceCardSelect);

  if (categoryId !== "all") {
    query = query.eq("category", categoryId);
  }

  const { data, error } = await query;

  throwIfError(error);

  return (data ?? []) as ServiceWithProvider[];
}

export async function searchServices(search: string) {
  const normalizedSearch = search.trim();
  const { data, error } = await supabase
    .from("service")
    .select(serviceSearchSelect)
    .or(
      `name.ilike.%${normalizedSearch}%,description.ilike.%${normalizedSearch}%`
    );

  throwIfError(error);

  return (data ?? []) as ServiceWithProviderAndCategory[];
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
