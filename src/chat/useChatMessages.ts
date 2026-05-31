import { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import {
  listRemoteMessagesByRequest,
  listRemoteMessagesByRequestSinceServer,
  subscribeToRemoteMessages,
} from "@/api/messages";
import { useAuthCtx } from "@/context/Auth";
import { useChatSync } from "./ChatSyncProvider";
import {
  getLatestLocalServerTimestamp,
  listLocalMessagesByRequest,
  upsertRemoteMessageToLocal,
} from "./messages";
import { chatMessagesKeys } from "./sync";

const FULL_RECONCILIATION_INTERVAL_MS = 30_000;

export default function useChatMessages(requestId: string) {
  const queryClient = useQueryClient();
  const { authenticated } = useAuthCtx();
  const { isOnline, syncVersion } = useChatSync();
  const [isSyncingRemote, setIsSyncingRemote] = useState(false);
  const isMountedRef = useRef(true);
  const isSyncingRef = useRef(false);
  const shouldSyncAgainRef = useRef(false);
  const shouldFullReconcileRef = useRef(false);

  const query = useQuery({
    queryKey: chatMessagesKeys.byRequest(requestId),
    queryFn: () => listLocalMessagesByRequest(requestId),
  });

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const syncRemoteMessages = useCallback(async (fullReconciliation = false) => {
    if (!authenticated || !isOnline) {
      setIsSyncingRemote(false);
      return;
    }

    if (isSyncingRef.current) {
      shouldSyncAgainRef.current = true;
      shouldFullReconcileRef.current =
        shouldFullReconcileRef.current || fullReconciliation;
      return;
    }

    isSyncingRef.current = true;
    shouldFullReconcileRef.current = fullReconciliation;
    setIsSyncingRemote(true);

    try {
      do {
        shouldSyncAgainRef.current = false;
        const shouldRunFullReconciliation = shouldFullReconcileRef.current;
        shouldFullReconcileRef.current = false;
        const remoteMessages = shouldRunFullReconciliation
          ? await listRemoteMessagesByRequest(requestId)
          : await listRemoteMessagesByRequestSinceServer(
              requestId,
              await getLatestLocalServerTimestamp(requestId)
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
    if (authenticated && isOnline && syncVersion > 0) {
      syncRemoteMessages(true);
    }
  }, [authenticated, isOnline, syncRemoteMessages, syncVersion]);

  useEffect(() => {
    if (!authenticated || !isOnline) {
      setIsSyncingRemote(false);
      return;
    }

    const reconnectSyncTimer = setTimeout(() => {
      syncRemoteMessages(true);
    }, 450);

    const reconciliationInterval = setInterval(() => {
      syncRemoteMessages(true);
    }, FULL_RECONCILIATION_INTERVAL_MS);

    const appStateSubscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        syncRemoteMessages(true);
      }
    });

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
      clearInterval(reconciliationInterval);
      appStateSubscription.remove();
      unsubscribe();
    };
  }, [authenticated, isOnline, queryClient, requestId, syncRemoteMessages]);

  return {
    ...query,
    isSyncingRemote,
  };
}
