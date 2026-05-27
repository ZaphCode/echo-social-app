import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { AppState } from "react-native";
import { useQueryClient } from "@tanstack/react-query";

import { useAuthCtx } from "@/context/Auth";
import { useOffline } from "@/context/Offline";
import { flushPendingMessages, retryMessageByClientId } from "./sync";

type ChatSyncContextType = {
  isOnline: boolean;
  flushPendingMessages: () => Promise<void>;
  retryMessage: (clientId: string) => Promise<void>;
};

const ChatSyncContext = createContext<ChatSyncContextType>({
  isOnline: false,
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

  const runFlush = useCallback(async () => {
    if (!authenticated || !isOnline || isFlushingRef.current) return;

    isFlushingRef.current = true;

    try {
      await flushPendingMessages({
        isOnline,
        queryClient,
      });
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
      flushPendingMessages: runFlush,
      retryMessage: async (clientId: string) => {
        await retryMessageByClientId(clientId, {
          isOnline,
          queryClient,
        });
      },
    }),
    [isOnline, queryClient, runFlush]
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
