import { supabase } from "@/lib/supabase";
import { Contracting } from "@/models/Contracting";
import { throwIfError } from "./common";
import { uploadContractingImages } from "./storage";
import { ContractingWithOwner } from "./types";

const contractingCardSelect = "*, owner_profile:profiles!owner(*)";

export const contractingsKeys = {
  all: ["contractings"] as const,
  byCategory: (categoryId: string, userId: string) =>
    ["contractings", "category", categoryId, userId] as const,
  detail: (contractingId: string) =>
    ["contractings", "detail", contractingId] as const,
};

export type SaveContractingInput = {
  ownerId: string;
  name: string;
  description: string;
  category: string;
  basePrice: number;
  photos: string[];
};

export async function listContractingsByCategory(
  categoryId: string,
  userId: string
) {
  let query = supabase
    .from("contracting")
    .select(contractingCardSelect)
    .or(`is_closed.eq.false,owner.eq.${userId}`)
    .order("is_closed", { ascending: true })
    .order("created_at", { ascending: false });

  if (categoryId !== "all") {
    query = query.eq("category", categoryId);
  }

  const { data, error } = await query;

  throwIfError(error);

  return (data ?? []) as ContractingWithOwner[];
}

export async function createContracting(input: SaveContractingInput) {
  const photos = await uploadContractingImages(input.ownerId, input.photos);

  const payload = {
    owner: input.ownerId,
    name: input.name,
    description: input.description,
    category: input.category,
    base_price: input.basePrice,
    photos,
  };

  const { data, error } = await supabase
    .from("contracting")
    .insert(payload)
    .select(contractingCardSelect)
    .single();

  throwIfError(error);

  return data as ContractingWithOwner;
}

export async function updateContracting(
  contractingId: string,
  input: SaveContractingInput
) {
  const photos = await uploadContractingImages(input.ownerId, input.photos);

  const payload: Partial<Contracting> = {
    name: input.name,
    description: input.description,
    category: input.category,
    base_price: input.basePrice,
    photos,
  };

  const { data, error } = await supabase
    .from("contracting")
    .update(payload)
    .eq("id", contractingId)
    .select(contractingCardSelect)
    .single();

  throwIfError(error);

  return data as ContractingWithOwner;
}
