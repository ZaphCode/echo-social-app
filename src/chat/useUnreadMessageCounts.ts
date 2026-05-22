import { useQuery } from "@tanstack/react-query";

import { listIncomingMessagesByRequests } from "@/api/messages";
import { ServiceRequestWithRelations } from "@/api/types";
import { listReadStatesByUser } from "./messages";
import { chatMessagesKeys } from "./sync";

function getMessageSentAt(message: {
  created_at: string;
  created_at_client?: string | null;
}) {
  return message.created_at_client ?? message.created_at;
}

export default function useUnreadMessageCounts(
  requests: ServiceRequestWithRelations[] | undefined,
  userId: string
) {
  const requestIds = requests?.map((request) => request.id) ?? [];

  return useQuery({
    queryKey: chatMessagesKeys.unreadCounts(userId, requestIds),
    enabled: requestIds.length > 0,
    queryFn: async () => {
      const [readStates, incomingMessages] = await Promise.all([
        listReadStatesByUser(userId),
        listIncomingMessagesByRequests(requestIds, userId),
      ]);

      return incomingMessages.reduce<Record<string, number>>((acc, message) => {
        const readAt = readStates[message.request];
        const sentAt = getMessageSentAt(message);
        const isUnread = !readAt || new Date(sentAt) > new Date(readAt);

        if (isUnread) {
          acc[message.request] = (acc[message.request] ?? 0) + 1;
        }

        return acc;
      }, {});
    },
  });
}
