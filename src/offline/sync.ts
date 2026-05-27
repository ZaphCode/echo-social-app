import { QueryClient } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";
import { notificationSelect, notificationsKeys } from "@/api/notifications";
import { profilesKeys } from "@/api/profiles";
import {
  serviceRequestSelect,
  serviceRequestsKeys,
  UpdateServiceRequestInput,
} from "@/api/serviceRequests";
import { servicesKeys, SaveServiceInput } from "@/api/services";
import { contractingsKeys, SaveContractingInput } from "@/api/contractings";
import {
  ClientProfileWithUser,
  ContractingWithOwner,
  NotificationWithUser,
  ProviderProfileWithCategory,
  ServiceRequestWithRelations,
  ServiceWithProvider,
} from "@/api/types";
import {
  cacheContractings,
  cacheNotifications,
  cacheProfile,
  cacheProfileDetails,
  cacheServiceRequests,
  cacheServices,
  listPendingOfflineMutations,
  markOfflineMutationStatus,
  OfflineMutation,
  updateCachedProfileAvatar,
} from "./store";
import { throwIfError } from "@/api/common";
import { ClientProfile } from "@/models/ClientProfile";
import { ProviderProfile } from "@/models/ProviderProfile";
import { User } from "@/models/User";
import {
  isLocalUri,
  normalizeStoragePath,
  resolveStorageUrl,
  uploadAvatarImage,
  uploadContractingImages,
  uploadServiceImages,
} from "@/api/storage";

type SyncOptions = {
  isOnline: boolean;
  queryClient: QueryClient;
};

const clientProfileSelect = "*, user_profile:profiles!user(*)";
const providerProfileSelect =
  "*, user_profile:profiles!user(*), specialty_category:service_category!specialty(*)";
const serviceCardSelect = "*, provider_profile:profiles!provider(*)";
const contractingCardSelect = "*, owner_profile:profiles!owner(*)";

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  return "No se pudo sincronizar el cambio local.";
}

function parseMutationPayload<T>(mutation: OfflineMutation) {
  return JSON.parse(mutation.payload_json) as T;
}

function isRemoteNewer(remoteUpdatedAt: string, baseUpdatedAt: string | null) {
  if (!baseUpdatedAt) return false;
  return new Date(remoteUpdatedAt).getTime() > new Date(baseUpdatedAt).getTime();
}

export async function flushOfflineMutations({
  isOnline,
  queryClient,
}: SyncOptions) {
  if (!isOnline) return;

  const mutations = await listPendingOfflineMutations();
  const touchedRequestUserIds = new Set<string>();
  const touchedNotificationUserIds = new Set<string>();
  const touchedProfileUserIds = new Set<string>();
  const locallySyncedRequestIds = new Set<string>();

  for (const mutation of mutations) {
    await markOfflineMutationStatus(mutation.id, "syncing");

    try {
      if (mutation.action === "service_request_create") {
        const request = await syncCreateServiceRequest(mutation);
        locallySyncedRequestIds.add(request.id);
        touchedRequestUserIds.add(request.client);
        touchedRequestUserIds.add(request.provider);
      } else if (mutation.action === "service_request_update") {
        const request = await syncUpdateServiceRequest(
          mutation,
          locallySyncedRequestIds.has(mutation.entity_id)
        );
        locallySyncedRequestIds.add(request.id);
        touchedRequestUserIds.add(request.client);
        touchedRequestUserIds.add(request.provider);
      } else if (mutation.action === "notification_create") {
        const notification = await syncCreateNotification(mutation);
        touchedNotificationUserIds.add(notification.user);
      } else if (mutation.action === "notification_mark_read") {
        const notification = await syncMarkNotificationRead(mutation);
        touchedNotificationUserIds.add(notification.user);
      } else if (mutation.action === "client_profile_update") {
        const profile = await syncClientProfileUpdate(mutation);
        touchedProfileUserIds.add(profile.user_profile.id);
      } else if (mutation.action === "provider_profile_update") {
        const profile = await syncProviderProfileUpdate(mutation);
        touchedProfileUserIds.add(profile.user_profile.id);
      } else if (mutation.action === "profile_avatar_update") {
        const user = await syncProfileAvatarUpdate(mutation);
        touchedProfileUserIds.add(user.id);
      } else if (mutation.action === "service_update") {
        const service = await syncServiceUpdate(mutation);
        touchedProfileUserIds.add(service.provider);
      } else if (mutation.action === "contracting_update") {
        const contracting = await syncContractingUpdate(mutation);
        touchedProfileUserIds.add(contracting.owner);
      }

      await markOfflineMutationStatus(mutation.id, "sent");
    } catch (error) {
      if (error instanceof ConflictError) {
        const actorUserId = getMutationActorUserId(mutation);
        if (actorUserId) touchedProfileUserIds.add(actorUserId);
        await markOfflineMutationStatus(mutation.id, "conflict", error.message);
      } else {
        await markOfflineMutationStatus(
          mutation.id,
          "failed",
          getErrorMessage(error)
        );
      }
    }
  }

  for (const userId of touchedRequestUserIds) {
    await queryClient.invalidateQueries({
      queryKey: serviceRequestsKeys.allForUser(userId),
    });
  }

  for (const userId of touchedNotificationUserIds) {
    await queryClient.invalidateQueries({
      queryKey: notificationsKeys.byUser(userId),
    });
    await queryClient.invalidateQueries({
      queryKey: notificationsKeys.unreadCount(userId),
    });
  }

  if (touchedProfileUserIds.size > 0) {
    await queryClient.invalidateQueries({ queryKey: profilesKeys.all });
    await queryClient.invalidateQueries({ queryKey: servicesKeys.all });
    await queryClient.invalidateQueries({ queryKey: contractingsKeys.all });
  }
}

function getMutationActorUserId(mutation: OfflineMutation) {
  try {
    const payload = parseMutationPayload<{ actorUserId?: string }>(mutation);
    return payload.actorUserId ?? null;
  } catch {
    return null;
  }
}

async function assertRemoteSessionForUser(userId: string) {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  throwIfError(error);

  if (session?.user.id !== userId) {
    throw new Error("La sesión remota activa no coincide con el cambio local.");
  }
}

async function syncCreateServiceRequest(mutation: OfflineMutation) {
  const payload = parseMutationPayload<Record<string, unknown>>(mutation);
  const { data, error } = await supabase
    .from("service_request")
    .upsert(payload, { onConflict: "id", ignoreDuplicates: false })
    .select(serviceRequestSelect)
    .single();

  throwIfError(error);

  const request = data as ServiceRequestWithRelations;
  await cacheServiceRequests(request.client, [request]);
  await cacheServiceRequests(request.provider, [request]);

  return request;
}

async function syncUpdateServiceRequest(
  mutation: OfflineMutation,
  skipConflictCheck: boolean
) {
  const patch = parseMutationPayload<UpdateServiceRequestInput>(mutation);
  const { data: remote, error: fetchError } = await supabase
    .from("service_request")
    .select(serviceRequestSelect)
    .eq("id", mutation.entity_id)
    .single();

  throwIfError(fetchError);

  const remoteRequest = remote as ServiceRequestWithRelations;

  if (
    !skipConflictCheck &&
    isRemoteNewer(remoteRequest.updated_at, mutation.base_updated_at)
  ) {
    await cacheServiceRequests(remoteRequest.client, [remoteRequest]);
    await cacheServiceRequests(remoteRequest.provider, [remoteRequest]);
    throw new ConflictError("El servidor tiene una versión más reciente.");
  }

  const { data, error } = await supabase
    .from("service_request")
    .update(patch)
    .eq("id", mutation.entity_id)
    .select(serviceRequestSelect)
    .single();

  throwIfError(error);

  const request = data as ServiceRequestWithRelations;
  await cacheServiceRequests(request.client, [request]);
  await cacheServiceRequests(request.provider, [request]);

  return request;
}

async function syncCreateNotification(mutation: OfflineMutation) {
  const payload = parseMutationPayload<Record<string, unknown>>(mutation);
  const { data, error } = await supabase
    .from("notification")
    .upsert(payload, { onConflict: "id", ignoreDuplicates: false })
    .select(notificationSelect)
    .single();

  throwIfError(error);

  const notification = data as NotificationWithUser;
  await cacheNotifications(notification.user, [notification]);

  return notification;
}

async function syncMarkNotificationRead(mutation: OfflineMutation) {
  const { data, error } = await supabase
    .from("notification")
    .update({ read: true })
    .eq("id", mutation.entity_id)
    .select(notificationSelect)
    .single();

  throwIfError(error);

  const notification = data as NotificationWithUser;
  await cacheNotifications(notification.user, [notification]);

  return notification;
}

type ProfileUpdatePayload<TPatch> = {
  profileId: string;
  actorUserId: string;
  patch: TPatch;
};

async function syncClientProfileUpdate(mutation: OfflineMutation) {
  const payload = parseMutationPayload<ProfileUpdatePayload<Partial<ClientProfile>>>(
    mutation
  );
  await assertRemoteSessionForUser(payload.actorUserId);

  const { data: remote, error: fetchError } = await supabase
    .from("client_profile")
    .select(clientProfileSelect)
    .eq("id", payload.profileId)
    .single();

  throwIfError(fetchError);

  const remoteProfile = remote as ClientProfileWithUser;
  if (remoteProfile.user_profile.id !== payload.actorUserId) {
    throw new Error("No puedes sincronizar el perfil de otro usuario.");
  }

  if (isRemoteNewer(remoteProfile.updated_at, mutation.base_updated_at)) {
    await cacheProfileDetails(remoteProfile);
    throw new ConflictError("El servidor tiene una versión más reciente.");
  }

  const { data, error } = await supabase
    .from("client_profile")
    .update(payload.patch)
    .eq("id", payload.profileId)
    .select(clientProfileSelect)
    .single();

  throwIfError(error);

  const profile = data as ClientProfileWithUser;
  await cacheProfileDetails(profile);
  return profile;
}

async function syncProviderProfileUpdate(mutation: OfflineMutation) {
  const payload = parseMutationPayload<ProfileUpdatePayload<Partial<ProviderProfile>>>(
    mutation
  );
  await assertRemoteSessionForUser(payload.actorUserId);

  const { data: remote, error: fetchError } = await supabase
    .from("provider_profile")
    .select(providerProfileSelect)
    .eq("id", payload.profileId)
    .single();

  throwIfError(fetchError);

  const remoteProfile = remote as ProviderProfileWithCategory;
  if (remoteProfile.user_profile.id !== payload.actorUserId) {
    throw new Error("No puedes sincronizar el perfil de otro usuario.");
  }

  if (isRemoteNewer(remoteProfile.updated_at, mutation.base_updated_at)) {
    await cacheProfileDetails(remoteProfile);
    throw new ConflictError("El servidor tiene una versión más reciente.");
  }

  const { data, error } = await supabase
    .from("provider_profile")
    .update(payload.patch)
    .eq("id", payload.profileId)
    .select(providerProfileSelect)
    .single();

  throwIfError(error);

  const profile = data as ProviderProfileWithCategory;
  await cacheProfileDetails(profile);
  return profile;
}

async function syncProfileAvatarUpdate(mutation: OfflineMutation) {
  const payload = parseMutationPayload<{
    actorUserId: string;
    avatarPath: string;
  }>(mutation);
  await assertRemoteSessionForUser(payload.actorUserId);

  const { data: remote, error: fetchError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", payload.actorUserId)
    .single();

  throwIfError(fetchError);

  const remoteUser = remote as User;
  if (isRemoteNewer(remoteUser.updated_at, mutation.base_updated_at)) {
    await cacheProfile(remoteUser);
    await updateCachedProfileAvatar(remoteUser.id, remoteUser.avatar);
    throw new ConflictError("El servidor tiene una versión más reciente.");
  }

  const avatarStoragePath = isLocalUri(payload.avatarPath)
    ? await uploadAvatarImage(payload.actorUserId, payload.avatarPath)
    : normalizeStoragePath("avatars", payload.avatarPath);
  const avatarValue = resolveStorageUrl("avatars", avatarStoragePath);

  const { data, error } = await supabase
    .from("profiles")
    .update({ avatar: avatarValue })
    .eq("id", payload.actorUserId)
    .select("*")
    .single();

  throwIfError(error);

  const user = data as User;
  await cacheProfile(user);
  await updateCachedProfileAvatar(user.id, user.avatar);

  return user;
}

async function syncServiceUpdate(mutation: OfflineMutation) {
  const payload = parseMutationPayload<{
    serviceId: string;
    actorUserId: string;
    input: SaveServiceInput;
  }>(mutation);
  await assertRemoteSessionForUser(payload.actorUserId);

  const { data: remote, error: fetchError } = await supabase
    .from("service")
    .select(serviceCardSelect)
    .eq("id", payload.serviceId)
    .single();

  throwIfError(fetchError);

  const remoteService = remote as ServiceWithProvider;
  if (remoteService.provider !== payload.actorUserId) {
    throw new Error("No puedes sincronizar un servicio de otro usuario.");
  }

  if (isRemoteNewer(remoteService.updated_at, mutation.base_updated_at)) {
    await cacheServices([remoteService], { visited: true });
    throw new ConflictError("El servidor tiene una versión más reciente.");
  }

  const photos = await uploadServiceImages(
    payload.actorUserId,
    payload.input.photos
  );
  const { data, error } = await supabase
    .from("service")
    .update({
      name: payload.input.name,
      description: payload.input.description,
      category: payload.input.category,
      base_price: payload.input.basePrice,
      photos,
    })
    .eq("id", payload.serviceId)
    .select(serviceCardSelect)
    .single();

  throwIfError(error);

  const service = data as ServiceWithProvider;
  await cacheServices([service], { visited: true });

  return service;
}

async function syncContractingUpdate(mutation: OfflineMutation) {
  const payload = parseMutationPayload<{
    contractingId: string;
    actorUserId: string;
    input: SaveContractingInput;
  }>(mutation);
  await assertRemoteSessionForUser(payload.actorUserId);

  const { data: remote, error: fetchError } = await supabase
    .from("contracting")
    .select(contractingCardSelect)
    .eq("id", payload.contractingId)
    .single();

  throwIfError(fetchError);

  const remoteContracting = remote as ContractingWithOwner;
  if (remoteContracting.owner !== payload.actorUserId) {
    throw new Error("No puedes sincronizar una contratación de otro usuario.");
  }

  if (isRemoteNewer(remoteContracting.updated_at, mutation.base_updated_at)) {
    await cacheContractings([remoteContracting]);
    throw new ConflictError("El servidor tiene una versión más reciente.");
  }

  const photos = await uploadContractingImages(
    payload.actorUserId,
    payload.input.photos
  );
  const { data, error } = await supabase
    .from("contracting")
    .update({
      name: payload.input.name,
      description: payload.input.description,
      category: payload.input.category,
      base_price: payload.input.basePrice,
      photos,
    })
    .eq("id", payload.contractingId)
    .select(contractingCardSelect)
    .single();

  throwIfError(error);

  const contracting = data as ContractingWithOwner;
  await cacheContractings([contracting]);

  return contracting;
}

class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConflictError";
  }
}
