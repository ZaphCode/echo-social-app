import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AppState } from "react-native";
import { useQueryClient } from "@tanstack/react-query";

import { useAuthCtx } from "@/context/Auth";
import { useOffline } from "@/context/Offline";
import { flushPendingMessages, retryMessageByClientId } from "./sync";

type ChatSyncContextType = {
  isOnline: boolean;
  syncVersion: number;
  flushPendingMessages: () => Promise<void>;
  retryMessage: (clientId: string) => Promise<void>;
};

const ChatSyncContext = createContext<ChatSyncContextType>({
  isOnline: false,
  syncVersion: 0,
  flushPendingMessages: async () => {},
  retryMessage: async () => {},
});

export function ChatSyncProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = useQueryClient();
  const { authenticated } = useAuthCtx();
  const { isOnline } = useOffline();
  const isFlushingRef = useRef(false);
  const [syncVersion, setSyncVersion] = useState(0);

  const runFlush = useCallback(async () => {
    if (!authenticated || !isOnline || isFlushingRef.current) return;

    isFlushingRef.current = true;

    try {
      const touchedRequestIds = await flushPendingMessages({
        isOnline,
        queryClient,
      });

      if (touchedRequestIds.length > 0) {
        setSyncVersion((version) => version + 1);
      }
    } finally {
      isFlushingRef.current = false;
    }
  }, [authenticated, isOnline, queryClient]);

  useEffect(() => {
    if (authenticated && isOnline) {
      runFlush();
    }
  }, [authenticated, isOnline, runFlush]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        runFlush();
      }
    });

    return () => subscription.remove();
  }, [runFlush]);

  const value = useMemo<ChatSyncContextType>(
    () => ({
      isOnline,
      syncVersion,
      flushPendingMessages: runFlush,
      retryMessage: async (clientId: string) => {
        const touchedRequestIds = await retryMessageByClientId(clientId, {
          isOnline,
          queryClient,
        });

        if (touchedRequestIds && touchedRequestIds.length > 0) {
          setSyncVersion((version) => version + 1);
        }
      },
    }),
    [isOnline, queryClient, runFlush, syncVersion]
  );

  return (
    <ChatSyncContext.Provider value={value}>
      {children}
    </ChatSyncContext.Provider>
  );
}

export function useChatSync() {
  return useContext(ChatSyncContext);
}
