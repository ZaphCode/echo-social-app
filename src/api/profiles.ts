import { supabase } from "@/lib/supabase";
import { ClientProfile } from "@/models/ClientProfile";
import { ProviderProfile } from "@/models/ProviderProfile";
import { User } from "@/models/User";
import { isAuthError, throwIfError } from "./common";
import { resolveStorageUrl } from "./storage";
import { ClientProfileWithUser, ProviderProfileWithCategory } from "./types";
import { getOfflineNetworkState, isLikelyNetworkError } from "@/offline/network";
import {
  cacheProfileDetails,
  getCachedProfile,
  getCachedProfileDetails,
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

  if (session?.user.id !== user.id) {
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
) {
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
}

export async function updateProviderProfile(
  profileId: string,
  patch: Partial<ProviderProfile>,
) {
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
}

export async function updateProfileAvatar(userId: string, avatarPath: string) {
  const {
    data: { user: authUser },
    error: authError,
  } = await supabase.auth.getUser();

  throwIfError(authError);

  if (!authUser) {
    throw new Error("No authenticated user found while updating avatar");
  }

  if (authUser.id !== userId) {
    console.log(
      `[updateProfileAvatar] Auth user mismatch. Expected ${userId}, using ${authUser.id} instead.`,
    );
  }

  const avatarValue = resolveStorageUrl("avatars", avatarPath);

  const { data, error } = await supabase
    .from("profiles")
    .update({ avatar: avatarValue })
    .eq("id", authUser.id)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Profile avatar update failed: ${error.message}`);
  }

  return data as User;
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
