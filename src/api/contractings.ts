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
import {
  Coords,
  MapBounds,
  roundBoundsForKey,
  roundForKey,
  snapCoords,
  sortByProximity,
  toCoords,
} from "@/utils/geo";
import { logError } from "@/utils/testing";

const contractingCardSelect = "*, owner_profile:profiles!owner(*)";

export const contractingsKeys = {
  all: ["contractings"] as const,
  byCategory: (categoryId: string, userId: string, coords?: Coords | null) =>
    coords === undefined
      ? (["contractings", "category", categoryId, userId] as const)
      : ([
          "contractings",
          "category",
          categoryId,
          userId,
          roundForKey(coords),
        ] as const),
  inBounds: (categoryId: string, bounds: MapBounds) =>
    ["contractings", "bounds", categoryId, roundBoundsForKey(bounds)] as const,
  privateLocation: (contractingId: string) =>
    ["contractings", "private-location", contractingId] as const,
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
  /**
   * Exact point picked by the owner. `undefined` leaves the saved location
   * untouched, `null` removes it. Only a snapped copy is ever public.
   */
  location?: Coords | null;
};

export const contractingCoords = (contracting: Contracting) =>
  toCoords(contracting.lat, contracting.lon);

const contractingCreatedAt = (contracting: Contracting) =>
  contracting.created_at;

/**
 * Open contractings (plus the user's own) ordered by distance bucket and
 * then recency. Without `coords` the order is newest first.
 */
export async function listContractingsByCategory(
  categoryId: string,
  userId: string,
  coords?: Coords | null
) {
  const origin = coords ?? null;
  const sortCached = async () => {
    const cached = await listCachedContractingsByCategory(categoryId, userId);
    const open = cached.filter((item) => !item.is_closed);
    const closed = cached.filter((item) => item.is_closed);
    return [
      ...sortByProximity(open, origin, contractingCoords, contractingCreatedAt),
      ...sortByProximity(closed, origin, contractingCoords, contractingCreatedAt),
    ];
  };

  if (!getOfflineNetworkState()) {
    return sortCached();
  }

  try {
    const { data, error } = await supabase
      .rpc("list_contractings_nearby", {
        p_lat: origin?.lat ?? null,
        p_lon: origin?.lon ?? null,
        p_category: categoryId,
        p_user: userId,
      })
      .select(contractingCardSelect);

    throwIfError(error);

    const contractings = (data ?? []) as unknown as ContractingWithOwner[];
    await cacheContractings(contractings);

    return contractings;
  } catch (error) {
    if (isLikelyNetworkError(error)) {
      return sortCached();
    }

    throw error;
  }
}

/** Open contractings with a location inside `bounds` (map view, online only). */
export async function listContractingsInBounds(
  categoryId: string,
  bounds: MapBounds
) {
  const { data, error } = await supabase
    .rpc("list_contractings_in_bounds", {
      min_lat: bounds.minLat,
      min_lon: bounds.minLon,
      max_lat: bounds.maxLat,
      max_lon: bounds.maxLon,
      p_category: categoryId,
    })
    .select(contractingCardSelect);

  throwIfError(error);

  return (data ?? []) as unknown as ContractingWithOwner[];
}

/** Exact location of a contracting. RLS only returns it to the owner. */
export async function getContractingPrivateLocation(contractingId: string) {
  const { data, error } = await supabase
    .from("contracting_location_private")
    .select("lat, lon")
    .eq("contracting", contractingId)
    .maybeSingle();

  throwIfError(error);

  return data ? toCoords(data.lat, data.lon) : null;
}

/**
 * Saves (or clears) the exact location. A database trigger copies a snapped
 * version to contracting.lat/lon.
 */
export async function saveContractingLocation(
  contractingId: string,
  location: Coords | null
) {
  if (location === null) {
    const { error } = await supabase
      .from("contracting_location_private")
      .delete()
      .eq("contracting", contractingId);
    throwIfError(error);
    return;
  }

  const { error } = await supabase
    .from("contracting_location_private")
    .upsert({ contracting: contractingId, lat: location.lat, lon: location.lon });
  throwIfError(error);
}

async function fetchContractingCard(contractingId: string) {
  const { data, error } = await supabase
    .from("contracting")
    .select(contractingCardSelect)
    .eq("id", contractingId)
    .single();

  throwIfError(error);

  return data as ContractingWithOwner;
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

  let contracting = data as ContractingWithOwner;

  if (input.location) {
    try {
      // The request is already published; a failed location write only
      // keeps it off the map instead of failing the whole publication.
      await saveContractingLocation(contracting.id, input.location);
      contracting = await fetchContractingCard(contracting.id);
    } catch (error) {
      logError(error);
    }
  }

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

  if (input.location !== undefined) {
    const snapped = input.location ? snapCoords(input.location) : null;
    payload.lat = snapped?.lat ?? null;
    payload.lon = snapped?.lon ?? null;
  }

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

    if (input.location !== undefined) {
      await saveContractingLocation(contractingId, input.location);
    }

    const photos = await uploadContractingImages(input.ownerId, input.photos);
    // lat/lon are owned by the location trigger, never written directly.
    const { lat: _lat, lon: _lon, ...remoteFields } = payload;
    const remotePayload = { ...remoteFields, photos };
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
