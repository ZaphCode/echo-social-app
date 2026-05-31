import { supabase } from "@/lib/supabase";
import { Message } from "@/models/Message";
import { throwIfError } from "./common";

const messageSelect = "*";

export type IncomingMessageSummary = Pick<
  Message,
  "id" | "request" | "sender" | "created_at" | "created_at_client"
>;

export type UpsertRemoteMessageInput = Pick<
  Message,
  "content" | "sender" | "request"
> & {
  client_id: string;
  created_at_client: string;
};

export async function listRemoteMessagesByRequest(requestId: string) {
  const { data, error } = await supabase
    .from("message")
    .select(messageSelect)
    .eq("request", requestId)
    .order("created_at", { ascending: true });

  throwIfError(error);

  return (data ?? []) as Message[];
}

export async function listRemoteMessagesByRequestSinceServer(
  requestId: string,
  since: string | null
) {
  if (!since) {
    return listRemoteMessagesByRequest(requestId);
  }

  const { data, error } = await supabase
    .from("message")
    .select(messageSelect)
    .eq("request", requestId)
    .gt("created_at", since)
    .order("created_at", { ascending: true });

  throwIfError(error);

  return (data ?? []) as Message[];
}

export async function listIncomingMessagesByRequests(
  requestIds: string[],
  userId: string
) {
  if (requestIds.length === 0) return [];

  const { data, error } = await supabase
    .from("message")
    .select("id, request, sender, created_at, created_at_client")
    .in("request", requestIds)
    .neq("sender", userId);

  throwIfError(error);

  return (data ?? []) as IncomingMessageSummary[];
}

export async function upsertRemoteMessage(input: UpsertRemoteMessageInput) {
  const { data, error } = await supabase
    .from("message")
    .upsert(input, {
      onConflict: "client_id",
      ignoreDuplicates: false,
    })
    .select("*")
    .single();

  throwIfError(error);

  return data as Message;
}

export function subscribeToRemoteMessages(
  requestId: string,
  callback: (message: Message) => Promise<void> | void
) {
  const channel = supabase
    .channel(`message:request:${requestId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "message",
        filter: `request=eq.${requestId}`,
      },
      (payload) => {
        callback(payload.new as Message);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
