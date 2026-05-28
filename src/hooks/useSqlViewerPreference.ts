import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { SQL_VIEWER_ENABLED_KEY } from "@/utils/constants";

const listeners = new Set<(enabled: boolean) => void>();
let cachedSqlViewerEnabled: boolean | null = null;

function notifySqlViewerPreference(enabled: boolean) {
  listeners.forEach((listener) => listener(enabled));
}

export async function loadSqlViewerEnabled() {
  const value = await AsyncStorage.getItem(SQL_VIEWER_ENABLED_KEY);
  const enabled = value === "true";
  cachedSqlViewerEnabled = enabled;
  return enabled;
}

export async function saveSqlViewerEnabled(enabled: boolean) {
  cachedSqlViewerEnabled = enabled;
  notifySqlViewerPreference(enabled);
  await AsyncStorage.setItem(SQL_VIEWER_ENABLED_KEY, String(enabled));
}

export default function useSqlViewerPreference() {
  const [enabled, setEnabled] = useState(cachedSqlViewerEnabled ?? false);
  const [loading, setLoading] = useState(cachedSqlViewerEnabled === null);

  useEffect(() => {
    let mounted = true;

    const listener = (nextEnabled: boolean) => {
      if (mounted) setEnabled(nextEnabled);
    };

    listeners.add(listener);

    if (cachedSqlViewerEnabled === null) {
      loadSqlViewerEnabled()
        .then((nextEnabled) => {
          if (mounted) setEnabled(nextEnabled);
        })
        .finally(() => {
          if (mounted) setLoading(false);
        });
    } else {
      setLoading(false);
    }

    return () => {
      mounted = false;
      listeners.delete(listener);
    };
  }, []);

  const setSqlViewerEnabled = useCallback(async (nextEnabled: boolean) => {
    const previousValue = cachedSqlViewerEnabled ?? enabled;
    setEnabled(nextEnabled);

    try {
      await saveSqlViewerEnabled(nextEnabled);
    } catch (error) {
      cachedSqlViewerEnabled = previousValue;
      notifySqlViewerPreference(previousValue);
      throw error;
    }
  }, [enabled]);

  return {
    enabled,
    loading,
    setSqlViewerEnabled,
  };
}
