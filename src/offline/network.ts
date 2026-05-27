let currentIsOnline = true;

export function setOfflineNetworkState(isOnline: boolean) {
  currentIsOnline = isOnline;
}

export function getOfflineNetworkState() {
  return currentIsOnline;
}

export function isLikelyNetworkError(error: unknown) {
  if (!error) return false;

  const message = error instanceof Error ? error.message : String(error);
  const normalized = message.toLowerCase();

  return (
    normalized.includes("network") ||
    normalized.includes("fetch") ||
    normalized.includes("offline") ||
    normalized.includes("internet") ||
    normalized.includes("connection") ||
    normalized.includes("failed to fetch")
  );
}
