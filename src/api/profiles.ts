import { supabase } from "@/lib/supabase";
import { ClientProfile } from "@/models/ClientProfile";
import { ProviderProfile } from "@/models/ProviderProfile";
import { User } from "@/models/User";
import { isAuthError, throwIfError } from "./common";
import { isLocalUri, normalizeStoragePath, resolveStorageUrl, uploadAvatarImage } from "./storage";
import { ClientProfileWithUser, ProviderProfileWithCategory } from "./types";
import { getOfflineNetworkState, isLikelyNetworkError } from "@/offline/network";
import {
  cacheProfileDetails,
  enqueueOfflineMutation,
  getCachedProfile,
  getCachedProfileDetails,
  getCachedProfileDetailsByProfileId,
  updateCachedProfileAvatar,
  updateCachedProfileDetails,
} from "@/offline/store";

const clientProfileSelect = "*, user_profile:profiles!user(*)";
const providerProfileSelect =
  "*, user_profile:profiles!user(*), specialty_category:service_category!specialty(*)";

export const profilesKeys = {
  all: ["profiles"] as const,
  detail: (role: User["role"], userId: string) =>
    ["profiles", role, userId] as const,
};

export async function getProfileByUser(user: User) {
  const cachedDetails = await getCachedProfileDetails(user.id);

  if (!getOfflineNetworkState()) {
    if (cachedDetails) return cachedDetails;
    return getFallbackProfileDetails(user);
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    if (cachedDetails) return cachedDetails;
    return getFallbackProfileDetails(user);
  }

  if (user.role === "client") {
    try {
      const { data, error } = await supabase
        .from("client_profile")
        .select(clientProfileSelect)
        .eq("user", user.id)
        .single();

      throwIfError(error);

      const profile = data as ClientProfileWithUser;
      await cacheProfileDetails(profile);

      return profile;
    } catch (error) {
      if (isLikelyNetworkError(error) || isAuthError(error)) {
        if (cachedDetails) return cachedDetails;
      }

      throw error;
    }
  }

  try {
    const { data, error } = await supabase
      .from("provider_profile")
      .select(providerProfileSelect)
      .eq("user", user.id)
      .single();

    throwIfError(error);

    const profile = data as ProviderProfileWithCategory;
    await cacheProfileDetails(profile);

    return profile;
  } catch (error) {
    if (isLikelyNetworkError(error) || isAuthError(error)) {
      if (cachedDetails) return cachedDetails;
    }

    throw error;
  }
}

export async function updateClientProfile(
  profileId: string,
  patch: Partial<ClientProfile>,
  actorUserId: string,
) {
  const cached = await getCachedProfileDetailsByProfileId(profileId);

  if (!getOfflineNetworkState()) {
    return updateClientProfileLocally(profileId, patch, actorUserId, cached);
  }

  try {
    await assertRemoteSessionForProfileEdit(actorUserId, cached);

    const { data, error } = await supabase
      .from("client_profile")
      .update(patch)
      .eq("id", profileId)
      .select(clientProfileSelect)
      .single();

    throwIfError(error);

    const profile = data as ClientProfileWithUser;
    await cacheProfileDetails(profile);

    return profile;
  } catch (error) {
    if (isLikelyNetworkError(error) || isAuthError(error)) {
      return updateClientProfileLocally(profileId, patch, actorUserId, cached);
    }

    throw error;
  }
}

export async function updateProviderProfile(
  profileId: string,
  patch: Partial<ProviderProfile>,
  actorUserId: string,
) {
  const cached = await getCachedProfileDetailsByProfileId(profileId);

  if (!getOfflineNetworkState()) {
    return updateProviderProfileLocally(profileId, patch, actorUserId, cached);
  }

  try {
    await assertRemoteSessionForProfileEdit(actorUserId, cached);

    const { data, error } = await supabase
      .from("provider_profile")
      .update(patch)
      .eq("id", profileId)
      .select(providerProfileSelect)
      .single();

    throwIfError(error);

    const profile = data as ProviderProfileWithCategory;
    await cacheProfileDetails(profile);

    return profile;
  } catch (error) {
    if (isLikelyNetworkError(error) || isAuthError(error)) {
      return updateProviderProfileLocally(profileId, patch, actorUserId, cached);
    }

    throw error;
  }
}

export async function updateProfileAvatar(userId: string, avatarPath: string) {
  if (!getOfflineNetworkState()) {
    return updateProfileAvatarLocally(userId, avatarPath);
  }

  try {
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    throwIfError(authError);

    if (!authUser) {
      throw new Error("No authenticated user found while updating avatar");
    }

    if (authUser.id !== userId) {
      throw new Error("No puedes editar el perfil de otro usuario.");
    }

    const avatarStoragePath = isLocalUri(avatarPath)
      ? await uploadAvatarImage(userId, avatarPath)
      : normalizeStoragePath("avatars", avatarPath);
    const avatarValue = resolveStorageUrl("avatars", avatarStoragePath);

    const { data, error } = await supabase
      .from("profiles")
      .update({ avatar: avatarValue })
      .eq("id", authUser.id)
      .select("*")
      .single();

    if (error) {
      throw new Error(`Profile avatar update failed: ${error.message}`);
    }

    const user = data as User;
    await updateCachedProfileAvatar(user.id, user.avatar);

    return user;
  } catch (error) {
    if (isLikelyNetworkError(error) || isAuthError(error)) {
      return updateProfileAvatarLocally(userId, avatarPath);
    }

    throw error;
  }
}

async function updateClientProfileLocally(
  profileId: string,
  patch: Partial<ClientProfile>,
  actorUserId: string,
  cachedProfile?: Awaited<ReturnType<typeof getCachedProfileDetailsByProfileId>>
) {
  const cached = cachedProfile ?? await getCachedProfileDetailsByProfileId(profileId);
  if (
    !cached ||
    cached.user_profile.role !== "client" ||
    cached.user_profile.id !== actorUserId
  ) {
    throw new Error("No se encontró el perfil local para editar offline.");
  }

  const updated = await updateCachedProfileDetails(cached.user_profile.id, patch);
  if (!updated) {
    throw new Error("No se pudo guardar el perfil localmente.");
  }

  await enqueueOfflineMutation({
    entityType: "profile",
    entityId: profileId,
    action: "client_profile_update",
    payload: {
      profileId,
      actorUserId: cached.user_profile.id,
      patch,
    },
    baseUpdatedAt: cached.updated_at,
  });

  return updated as ClientProfileWithUser;
}

async function updateProviderProfileLocally(
  profileId: string,
  patch: Partial<ProviderProfile>,
  actorUserId: string,
  cachedProfile?: Awaited<ReturnType<typeof getCachedProfileDetailsByProfileId>>
) {
  const cached = cachedProfile ?? await getCachedProfileDetailsByProfileId(profileId);
  if (
    !cached ||
    cached.user_profile.role !== "provider" ||
    cached.user_profile.id !== actorUserId
  ) {
    throw new Error("No se encontró el perfil local para editar offline.");
  }

  const updated = await updateCachedProfileDetails(cached.user_profile.id, patch);
  if (!updated) {
    throw new Error("No se pudo guardar el perfil localmente.");
  }

  await enqueueOfflineMutation({
    entityType: "profile",
    entityId: profileId,
    action: "provider_profile_update",
    payload: {
      profileId,
      actorUserId: cached.user_profile.id,
      patch,
    },
    baseUpdatedAt: cached.updated_at,
  });

  return updated as ProviderProfileWithCategory;
}

async function assertRemoteSessionForProfileEdit(
  actorUserId: string,
  cachedProfile?: Awaited<ReturnType<typeof getCachedProfileDetailsByProfileId>>
) {
  if (cachedProfile && cachedProfile.user_profile.id !== actorUserId) {
    throw new Error("No puedes editar el perfil de otro usuario.");
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.user.id !== actorUserId) {
    throw new Error("Auth session mismatch for profile edit.");
  }
}

async function updateProfileAvatarLocally(userId: string, avatarPath: string) {
  const cached = await getCachedProfile(userId);
  if (!cached) {
    throw new Error("No se encontró el usuario local para editar offline.");
  }

  const updated = await updateCachedProfileAvatar(userId, avatarPath);
  if (!updated) {
    throw new Error("No se pudo guardar el avatar localmente.");
  }

  await enqueueOfflineMutation({
    entityType: "profile",
    entityId: userId,
    action: "profile_avatar_update",
    payload: {
      actorUserId: userId,
      avatarPath,
    },
    baseUpdatedAt: cached.updated_at,
  });

  return updated;
}

async function getFallbackProfileDetails(user: User) {
  const cached = await getCachedProfile(user.id);
  const userProfile = cached ?? user;

  if (user.role === "client") {
    return {
      id: user.id,
      user: user.id,
      phone: "",
      state: "",
      city: "",
      address: "",
      zip: "",
      updated_at: userProfile.updated_at,
      created_at: userProfile.created_at,
      user_profile: userProfile,
    } as ClientProfileWithUser;
  }

  return {
    id: user.id,
    user: user.id,
    specialty: "",
    phone: "",
    description: "",
    state: "",
    city: "",
    address: "",
    zip: "",
    jobs_done: 0,
    experience_years: 0,
    available_days: [],
    updated_at: userProfile.updated_at,
    created_at: userProfile.created_at,
    user_profile: userProfile,
    specialty_category: { id: "", name: "" },
  } as ProviderProfileWithCategory;
}

export async function incrementProviderJobsDone(
  profileId: string,
  currentJobsDone: number,
) {
  const { data, error } = await supabase
    .from("provider_profile")
    .update({ jobs_done: currentJobsDone + 1 })
    .eq("id", profileId)
    .select(providerProfileSelect)
    .single();

  throwIfError(error);

  return data as ProviderProfileWithCategory;
}
