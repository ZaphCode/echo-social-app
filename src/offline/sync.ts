import { QueryClient } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";
import { notificationSelect, notificationsKeys } from "@/api/notifications";
import {
  serviceRequestSelect,
  serviceRequestsKeys,
  UpdateServiceRequestInput,
} from "@/api/serviceRequests";
import { NotificationWithUser, ServiceRequestWithRelations } from "@/api/types";
import {
  cacheNotifications,
  cacheServiceRequests,
  listPendingOfflineMutations,
  markOfflineMutationStatus,
  OfflineMutation,
} from "./store";
import { throwIfError } from "@/api/common";

type SyncOptions = {
  isOnline: boolean;
  queryClient: QueryClient;
};

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
      }

      await markOfflineMutationStatus(mutation.id, "sent");
    } catch (error) {
      if (error instanceof ConflictError) {
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

class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConflictError";
  }
}
