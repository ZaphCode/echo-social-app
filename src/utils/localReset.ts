/**
 * Decides what to do with the local SQLite replica when the app starts.
 *
 * The server keeps a "data epoch" (public.app_meta.data_epoch) that changes
 * every time its data is reset (see seed/reset.ts). The device remembers the
 * last epoch it synced with. A different epoch means every cached row, queued
 * mutation and saved session may point at data that no longer exists, so the
 * replica is wiped and refilled from the server.
 */
export type LocalResetDecision =
  /** Nothing to do. */
  | "keep"
  /** First time this device sees an epoch: just remember it. */
  | "remember"
  /** Local data belongs to an older server state: wipe it. */
  | "wipe";

export type LocalResetInput = {
  /** Epoch stored on the device, or null if never stored. */
  localEpoch: string | null;
  /** Epoch reported by the server, or null if it couldn't be read (offline). */
  serverEpoch: string | null;
  /** The saved session belongs to a user the server no longer has. */
  sessionUserMissing: boolean;
};

export function decideLocalReset({
  localEpoch,
  serverEpoch,
  sessionUserMissing,
}: LocalResetInput): LocalResetDecision {
  if (sessionUserMissing) return "wipe";

  // Offline or server without app_meta: never wipe on missing information.
  if (!serverEpoch) return "keep";

  if (!localEpoch) return "remember";

  return localEpoch === serverEpoch ? "keep" : "wipe";
}

/**
 * True when an auth error means the session's user was deleted on the server
 * (as opposed to a network failure or an expired token that can refresh).
 */
export function isDeletedUserAuthError(
  error: { code?: string; status?: number; message?: string } | null | undefined
) {
  if (!error) return false;
  if (error.code === "user_not_found") return true;

  return (
    error.status === 403 &&
    /user .*does not exist/i.test(error.message ?? "")
  );
}
