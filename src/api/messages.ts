import { supabase } from "@/lib/supabase";
import { Message } from "@/models/Message";
import { throwIfError } from "./common";
import { MessageWithSender } from "./types";

const messageSelect = "*, sender_profile:profiles!sender(*)";

export const messagesKeys = {
  all: ["messages"] as const,
  byRequest: (requestId: string) => ["messages", "request", requestId] as const,
};

export type CreateMessageInput = Pick<Message, "content" | "sender" | "request">;

export async function listMessagesByRequest(requestId: string) {
  const { data, error } = await supabase
    .from("message")
    .select(messageSelect)
    .eq("request", requestId)
    .order("created_at", { ascending: true });

  throwIfError(error);

  return (data ?? []) as MessageWithSender[];
}

export async function createMessage(input: CreateMessageInput) {
  const { data, error } = await supabase
    .from("message")
    .insert(input)
    .select(messageSelect)
    .single();

  throwIfError(error);

  return data as MessageWithSender;
}
