import { supabase } from "@/lib/supabase";
import { Notification } from "@/models/Notification";
import { throwIfError } from "./common";
import { NotificationWithUser } from "./types";

const notificationSelect = "*, user_profile:profiles!user(*)";

export const notificationsKeys = {
  all: ["notifications"] as const,
  byUser: (userId: string) => ["notifications", "user", userId] as const,
};

export type CreateNotificationInput = Pick<
  Notification,
  "user" | "message" | "type" | "read"
> &
  Partial<Pick<Notification, "request" | "service">>;

export async function listNotificationsByUser(userId: string) {
  const { data, error } = await supabase
    .from("notification")
    .select(notificationSelect)
    .eq("user", userId)
    .order("created_at", { ascending: false });

  throwIfError(error);

  return (data ?? []) as NotificationWithUser[];
}

export async function createNotification(input: CreateNotificationInput) {
  const { data, error } = await supabase
    .from("notification")
    .insert(input)
    .select(notificationSelect)
    .single();

  throwIfError(error);

  return data as NotificationWithUser;
}

export async function markNotificationAsRead(notificationId: string) {
  const { data, error } = await supabase
    .from("notification")
    .update({ read: true })
    .eq("id", notificationId)
    .select(notificationSelect)
    .single();

  throwIfError(error);

  return data as NotificationWithUser;
}
