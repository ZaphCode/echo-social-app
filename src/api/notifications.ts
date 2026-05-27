import { supabase } from "@/lib/supabase";
import { Notification } from "@/models/Notification";
import { isAuthError, throwIfError } from "./common";
import { NotificationWithUser } from "./types";
import { getOfflineNetworkState, isLikelyNetworkError } from "@/offline/network";
import {
  cacheNotifications,
  countCachedUnreadNotifications,
  createOfflineNotification,
  enqueueOfflineMutation,
  listCachedNotifications,
  markCachedNotificationRead,
} from "@/offline/store";

export const notificationSelect = "*, user_profile:profiles!user(*)";

export const notificationsKeys = {
  all: ["notifications"] as const,
  byUser: (userId: string) => ["notifications", "user", userId] as const,
  unreadCount: (userId: string) =>
    ["notifications", "user", userId, "unreadCount"] as const,
};

export type CreateNotificationInput = Pick<
  Notification,
  "user" | "message" | "type" | "read"
> &
  Partial<Pick<Notification, "request" | "service" | "contracting">>;

export async function listNotificationsByUser(userId: string) {
  if (!getOfflineNetworkState()) {
    return listCachedNotifications(userId);
  }

  if (!(await hasRemoteSessionForUser(userId))) {
    return listCachedNotifications(userId);
  }

  try {
    const { data, error } = await supabase
      .from("notification")
      .select(notificationSelect)
      .eq("user", userId)
      .order("created_at", { ascending: false });

    throwIfError(error);

    const notifications = (data ?? []) as NotificationWithUser[];
    await cacheNotifications(userId, notifications);

    return notifications;
  } catch (error) {
    if (isLikelyNetworkError(error) || isAuthError(error)) {
      return listCachedNotifications(userId);
    }

    throw error;
  }
}

export async function countUnreadNotificationsByUser(userId: string) {
  if (!getOfflineNetworkState()) {
    return countCachedUnreadNotifications(userId);
  }

  if (!(await hasRemoteSessionForUser(userId))) {
    return countCachedUnreadNotifications(userId);
  }

  try {
    const { count, error } = await supabase
      .from("notification")
      .select("id", { count: "exact", head: true })
      .eq("user", userId)
      .eq("read", false);

    throwIfError(error);

    return count ?? 0;
  } catch (error) {
    if (isLikelyNetworkError(error) || isAuthError(error)) {
      return countCachedUnreadNotifications(userId);
    }

    throw error;
  }
}

async function hasRemoteSessionForUser(userId: string) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.user.id === userId;
}

export async function createNotification(input: CreateNotificationInput) {
  const notification = createOfflineNotification(input);
  const payload = {
    id: notification.id,
    user: input.user,
    message: input.message,
    type: input.type,
    read: input.read,
    request: input.request ?? null,
    service: input.service ?? null,
    contracting: input.contracting ?? null,
  };

  if (!getOfflineNetworkState()) {
    await enqueueOfflineMutation({
      entityType: "notification",
      entityId: notification.id,
      action: "notification_create",
      payload,
    });
    return;
  }

  try {
    const { error } = await supabase
      .from("notification")
      .insert(payload);

    throwIfError(error);
  } catch (error) {
    if (!isLikelyNetworkError(error)) throw error;

    await enqueueOfflineMutation({
      entityType: "notification",
      entityId: notification.id,
      action: "notification_create",
      payload,
    });
  }
}

export async function markNotificationAsRead(notificationId: string) {
  if (!getOfflineNetworkState()) {
    const cached = await markCachedNotificationRead(notificationId);
    await enqueueOfflineMutation({
      entityType: "notification",
      entityId: notificationId,
      action: "notification_mark_read",
      payload: { read: true },
    });

    if (cached) return cached;
    throw new Error("No hay una copia local de esta notificación.");
  }

  try {
    const { data, error } = await supabase
      .from("notification")
      .update({ read: true })
      .eq("id", notificationId)
      .select(notificationSelect)
      .single();

    throwIfError(error);

    const notification = data as NotificationWithUser;
    await cacheNotifications(notification.user, [notification]);

    return notification;
  } catch (error) {
    if (!isLikelyNetworkError(error)) throw error;

    const cached = await markCachedNotificationRead(notificationId);
    await enqueueOfflineMutation({
      entityType: "notification",
      entityId: notificationId,
      action: "notification_mark_read",
      payload: { read: true },
    });

    if (cached) return cached;
    throw error;
  }
}
