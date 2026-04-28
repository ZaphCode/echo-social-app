import { supabase } from "@/lib/supabase";
import { ClientProfile } from "@/models/ClientProfile";
import { ProviderProfile } from "@/models/ProviderProfile";
import { User } from "@/models/User";
import { throwIfError } from "./common";
import { resolveStorageUrl } from "./storage";
import { ClientProfileWithUser, ProviderProfileWithCategory } from "./types";

const clientProfileSelect = "*, user_profile:profiles!user(*)";
const providerProfileSelect =
  "*, user_profile:profiles!user(*), specialty_category:service_category!specialty(*)";

export const profilesKeys = {
  all: ["profiles"] as const,
  detail: (role: User["role"], userId: string) =>
    ["profiles", role, userId] as const,
};

export async function getProfileByUser(user: User) {
  if (user.role === "client") {
    const { data, error } = await supabase
      .from("client_profile")
      .select(clientProfileSelect)
      .eq("user", user.id)
      .single();

    throwIfError(error);

    return data as ClientProfileWithUser;
  }

  const { data, error } = await supabase
    .from("provider_profile")
    .select(providerProfileSelect)
    .eq("user", user.id)
    .single();

  throwIfError(error);

  return data as ProviderProfileWithCategory;
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

  return data as ClientProfileWithUser;
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

  return data as ProviderProfileWithCategory;
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
    console.warn(
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
