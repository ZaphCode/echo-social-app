import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import {
  listRemoteMessagesByRequest,
  subscribeToRemoteMessages,
} from "@/api/messages";
import { useAuthCtx } from "@/context/Auth";
import { listLocalMessagesByRequest, upsertRemoteMessageToLocal } from "./messages";
import { chatMessagesKeys } from "./sync";

export default function useChatMessages(requestId: string) {
  const queryClient = useQueryClient();
  const { authenticated } = useAuthCtx();

  const query = useQuery({
    queryKey: chatMessagesKeys.byRequest(requestId),
    queryFn: () => listLocalMessagesByRequest(requestId),
  });

  useEffect(() => {
    let mounted = true;

    async function bootstrapRemoteMessages() {
      try {
        const remoteMessages = await listRemoteMessagesByRequest(requestId);

        for (const remoteMessage of remoteMessages) {
          await upsertRemoteMessageToLocal(remoteMessage);
        }

        if (mounted) {
          await queryClient.invalidateQueries({
            queryKey: chatMessagesKeys.byRequest(requestId),
          });
        }
      } catch {
        // Keep rendering the local cache when offline or when the remote fetch fails.
      }
    }

    if (authenticated) {
      bootstrapRemoteMessages();
    }

    const unsubscribe = subscribeToRemoteMessages(requestId, async (message) => {
      await upsertRemoteMessageToLocal(message);
      await queryClient.invalidateQueries({
        queryKey: chatMessagesKeys.byRequest(requestId),
      });
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [authenticated, queryClient, requestId]);

  return query;
}
