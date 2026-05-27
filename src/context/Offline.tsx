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
import { useNetworkState } from "expo-network";
import { useQueryClient } from "@tanstack/react-query";

import {
  countPendingOfflineMutations,
  subscribeOfflineMutationQueue,
} from "@/offline/store";
import { flushOfflineMutations } from "@/offline/sync";
import { setOfflineNetworkState } from "@/offline/network";
import { useAuthCtx } from "./Auth";
import { bootstrapOfflineCacheForUser } from "@/offline/bootstrap";

type OfflineContextType = {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  syncNow: () => Promise<void>;
  refreshPendingCount: () => Promise<void>;
};

const OfflineContext = createContext<OfflineContextType>({
  isOnline: true,
  isSyncing: false,
  pendingCount: 0,
  syncNow: async () => {},
  refreshPendingCount: async () => {},
});

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const networkState = useNetworkState();
  const { authenticated, authMode, user } = useAuthCtx();
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const isSyncingRef = useRef(false);
  const bootstrappedUserRef = useRef<string | null>(null);
  const activeUserRef = useRef<string | null>(null);

  const isOnline =
    Boolean(networkState.isConnected) &&
    networkState.isInternetReachable !== false;

  const refreshPendingCount = useCallback(async () => {
    setPendingCount(await countPendingOfflineMutations());
  }, []);

  const syncNow = useCallback(async () => {
    if (!authenticated || !isOnline || isSyncingRef.current) return;

    isSyncingRef.current = true;
    setIsSyncing(true);

    try {
      await flushOfflineMutations({ isOnline, queryClient });
    } finally {
      await refreshPendingCount();
      isSyncingRef.current = false;
      setIsSyncing(false);
    }
  }, [authenticated, isOnline, queryClient, refreshPendingCount]);

  useEffect(() => {
    setOfflineNetworkState(isOnline);
  }, [isOnline]);

  useEffect(() => {
    refreshPendingCount();
  }, [refreshPendingCount]);

  useEffect(() => {
    return subscribeOfflineMutationQueue(refreshPendingCount);
  }, [refreshPendingCount]);

  useEffect(() => {
    const nextUserId = authenticated && user.id ? user.id : null;
    const previousUserId = activeUserRef.current;

    if (previousUserId && nextUserId && previousUserId !== nextUserId) {
      queryClient.clear();
      bootstrappedUserRef.current = null;
    }

    if (!nextUserId) {
      bootstrappedUserRef.current = null;
    }

    activeUserRef.current = nextUserId;
  }, [authenticated, queryClient, user.id]);

  useEffect(() => {
    if (authenticated && isOnline) {
      syncNow();
    }
  }, [authenticated, isOnline, syncNow]);

  useEffect(() => {
    if (!authenticated || !isOnline || authMode !== "online" || !user.id) {
      return;
    }

    if (bootstrappedUserRef.current === user.id) return;
    bootstrappedUserRef.current = user.id;

    bootstrapOfflineCacheForUser(user.id, queryClient).catch((error) => {
      bootstrappedUserRef.current = null;
      console.log("Offline cache bootstrap failed:", error);
    });
  }, [authMode, authenticated, isOnline, queryClient, user.id]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        refreshPendingCount();
        syncNow();
      }
    });

    return () => subscription.remove();
  }, [refreshPendingCount, syncNow]);

  const value = useMemo<OfflineContextType>(
    () => ({
      isOnline,
      isSyncing,
      pendingCount,
      syncNow,
      refreshPendingCount,
    }),
    [isOnline, isSyncing, pendingCount, refreshPendingCount, syncNow]
  );

  return (
    <OfflineContext.Provider value={value}>{children}</OfflineContext.Provider>
  );
}

export function useOffline() {
  return useContext(OfflineContext);
}
