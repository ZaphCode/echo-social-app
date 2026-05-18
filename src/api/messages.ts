import { supabase } from "@/lib/supabase";
import { Message } from "@/models/Message";
import { throwIfError } from "./common";

const messageSelect = "*";

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
    .order("created_at_client", { ascending: true });

  throwIfError(error);

  return (data ?? []) as Message[];
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
