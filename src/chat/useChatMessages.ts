import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import {
  listRemoteMessagesByRequestSince,
  subscribeToRemoteMessages,
} from "@/api/messages";
import { useAuthCtx } from "@/context/Auth";
import { useChatSync } from "./ChatSyncProvider";
import {
  getLatestLocalMessageTimestamp,
  listLocalMessagesByRequest,
  upsertRemoteMessageToLocal,
} from "./messages";
import { chatMessagesKeys } from "./sync";

export default function useChatMessages(requestId: string) {
  const queryClient = useQueryClient();
  const { authenticated } = useAuthCtx();
  const { isOnline } = useChatSync();
  const [isSyncingRemote, setIsSyncingRemote] = useState(false);
  const isMountedRef = useRef(true);
  const isSyncingRef = useRef(false);
  const shouldSyncAgainRef = useRef(false);

  const query = useQuery({
    queryKey: chatMessagesKeys.byRequest(requestId),
    queryFn: () => listLocalMessagesByRequest(requestId),
  });

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const syncRemoteMessages = useCallback(async () => {
    if (!authenticated || !isOnline) {
      setIsSyncingRemote(false);
      return;
    }

    if (isSyncingRef.current) {
      shouldSyncAgainRef.current = true;
      return;
    }

    isSyncingRef.current = true;
    setIsSyncingRemote(true);

    try {
      do {
        shouldSyncAgainRef.current = false;
        const latestLocalTimestamp =
          await getLatestLocalMessageTimestamp(requestId);
        const remoteMessages = await listRemoteMessagesByRequestSince(
          requestId,
          latestLocalTimestamp
        );
        let didChangeLocalMessages = false;

        for (const remoteMessage of remoteMessages) {
          const didChange = await upsertRemoteMessageToLocal(remoteMessage);
          didChangeLocalMessages = didChangeLocalMessages || didChange;
        }

        if (didChangeLocalMessages && isMountedRef.current) {
          await queryClient.invalidateQueries({
            queryKey: chatMessagesKeys.byRequest(requestId),
          });
        }
      } while (shouldSyncAgainRef.current);
    } catch {
      // Keep rendering the local cache when offline or when the remote fetch fails.
    } finally {
      isSyncingRef.current = false;
      if (isMountedRef.current) {
        setIsSyncingRemote(false);
      }
    }
  }, [authenticated, isOnline, queryClient, requestId]);

  useEffect(() => {
    if (!authenticated || !isOnline) {
      setIsSyncingRemote(false);
      return;
    }

    const reconnectSyncTimer = setTimeout(syncRemoteMessages, 450);

    const unsubscribe = subscribeToRemoteMessages(requestId, async (message) => {
      try {
        const didChange = await upsertRemoteMessageToLocal(message);
        if (didChange) {
          await queryClient.invalidateQueries({
            queryKey: chatMessagesKeys.byRequest(requestId),
          });
        }
      } catch {
        syncRemoteMessages();
      }
    });

    return () => {
      clearTimeout(reconnectSyncTimer);
      unsubscribe();
    };
  }, [authenticated, isOnline, queryClient, requestId, syncRemoteMessages]);

  return {
    ...query,
    isSyncingRemote,
  };
}
