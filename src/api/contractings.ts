import { supabase } from "@/lib/supabase";
import { Contracting } from "@/models/Contracting";
import { isAuthError, throwIfError } from "./common";
import { uploadContractingImages } from "./storage";
import { ContractingWithOwner } from "./types";
import { getOfflineNetworkState, isLikelyNetworkError } from "@/offline/network";
import {
  cacheContractings,
  enqueueOfflineMutation,
  getCachedContracting,
  listCachedContractingsByCategory,
  updateCachedContracting,
} from "@/offline/store";

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
  if (!getOfflineNetworkState()) {
    return listCachedContractingsByCategory(categoryId, userId);
  }

  try {
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

    const contractings = (data ?? []) as ContractingWithOwner[];
    await cacheContractings(contractings);

    return contractings;
  } catch (error) {
    if (isLikelyNetworkError(error)) {
      return listCachedContractingsByCategory(categoryId, userId);
    }

    throw error;
  }
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

  const contracting = data as ContractingWithOwner;
  await cacheContractings([contracting]);

  return contracting;
}

export async function updateContracting(
  contractingId: string,
  input: SaveContractingInput
) {
  const payload: Partial<Contracting> = {
    name: input.name,
    description: input.description,
    category: input.category,
    base_price: input.basePrice,
    photos: input.photos,
  };

  const cached = await getCachedContracting(contractingId);

  if (!getOfflineNetworkState()) {
    return updateContractingLocally(contractingId, input, payload, cached);
  }

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user.id !== input.ownerId) {
      return updateContractingLocally(contractingId, input, payload, cached);
    }

    const photos = await uploadContractingImages(input.ownerId, input.photos);
    const remotePayload = { ...payload, photos };
    const { data, error } = await supabase
      .from("contracting")
      .update(remotePayload)
      .eq("id", contractingId)
      .select(contractingCardSelect)
      .single();

    throwIfError(error);

    const contracting = data as ContractingWithOwner;
    await cacheContractings([contracting]);

    return contracting;
  } catch (error) {
    if (isLikelyNetworkError(error) || isAuthError(error)) {
      return updateContractingLocally(contractingId, input, payload, cached);
    }

    throw error;
  }
}

async function updateContractingLocally(
  contractingId: string,
  input: SaveContractingInput,
  payload: Partial<Contracting>,
  cached?: ContractingWithOwner | null
) {
  const current = cached ?? await getCachedContracting(contractingId);
  if (!current) {
    throw new Error("No se encontró la contratación local para editar offline.");
  }

  if (current.owner !== input.ownerId) {
    throw new Error("No puedes editar una contratación de otro usuario.");
  }

  const updated = await updateCachedContracting(
    contractingId,
    payload,
    input.ownerId
  );
  if (!updated) {
    throw new Error("No se pudo guardar la contratación localmente.");
  }

  await enqueueOfflineMutation({
    entityType: "contracting",
    entityId: contractingId,
    action: "contracting_update",
    payload: {
      contractingId,
      actorUserId: input.ownerId,
      input,
    },
    baseUpdatedAt: current.updated_at,
  });

  return updated;
}
