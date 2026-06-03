import { QueryClient } from "@tanstack/react-query";

import { upsertRemoteMessage } from "@/api/messages";
import {
  getMessageByClientId,
  listPendingMessages,
  markMessageFailed,
  markMessagePending,
  markMessageSending,
  markMessageSent,
} from "./messages";

export const chatMessagesKeys = {
  all: ["chatMessages"] as const,
  byRequest: (requestId: string) => ["chatMessages", "request", requestId] as const,
  unreadCountsForUser: (userId: string) =>
    ["chatMessages", "unreadCounts", userId] as const,
  unreadCounts: (userId: string, requestIds?: string[]) =>
    [...chatMessagesKeys.unreadCountsForUser(userId), requestIds?.join(",") ?? "all"] as const,
};

type FlushPendingMessagesOptions = {
  isOnline: boolean;
  queryClient: QueryClient;
};

const MESSAGE_SYNC_TIMEOUT_MS = 20_000;

function getSyncErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "No se pudo sincronizar el mensaje.";
}

function withMessageSyncTimeout<T>(promise: Promise<T>) {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error("Tiempo de espera agotado al sincronizar el mensaje."));
      }, MESSAGE_SYNC_TIMEOUT_MS);
    }),
  ]);
}

export async function flushPendingMessages({
  isOnline,
  queryClient,
}: FlushPendingMessagesOptions) {
  if (!isOnline) return [];

  const pendingMessages = await listPendingMessages();
  const touchedRequestIds: string[] = [];

  for (const pendingMessage of pendingMessages) {
    touchedRequestIds.push(pendingMessage.request_id);

    await markMessageSending(pendingMessage.client_id);

    try {
      const remoteMessage = await withMessageSyncTimeout(
        upsertRemoteMessage({
          client_id: pendingMessage.client_id,
          created_at_client: pendingMessage.created_at_client,
          content: pendingMessage.content,
          sender: pendingMessage.sender_id,
          request: pendingMessage.request_id,
        })
      );

      await markMessageSent(pendingMessage.client_id, remoteMessage);
    } catch (error) {
      await markMessageFailed(
        pendingMessage.client_id,
        getSyncErrorMessage(error)
      );
    }
  }

  const uniqueTouchedRequestIds = [...new Set(touchedRequestIds)];

  for (const requestId of uniqueTouchedRequestIds) {
    await queryClient.invalidateQueries({
      queryKey: chatMessagesKeys.byRequest(requestId),
    });
  }

  if (uniqueTouchedRequestIds.length > 0) {
    await queryClient.invalidateQueries({
      queryKey: chatMessagesKeys.all,
    });
  }

  return uniqueTouchedRequestIds;
}

export async function retryMessageByClientId(
  clientId: string,
  options: FlushPendingMessagesOptions
) {
  const message = await getMessageByClientId(clientId);

  if (!message) return;

  await markMessagePending(clientId);
  await options.queryClient.invalidateQueries({
    queryKey: chatMessagesKeys.byRequest(message.request_id),
  });

  return flushPendingMessages(options);
}
