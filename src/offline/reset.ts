import AsyncStorage from "@react-native-async-storage/async-storage";
import { isAuthRetryableFetchError } from "@supabase/supabase-js";

import { getChatDatabase } from "@/chat/db";
import { SUPABASE_AUTH_STORAGE_KEY, supabase } from "@/lib/supabase";
import { decideLocalReset, isDeletedUserAuthError } from "@/utils/localReset";

const EPOCH_KEY = "data_epoch";
const SERVER_TIMEOUT_MS = 4000;

async function readLocalEpoch() {
  const row = await getChatDatabase().getFirstAsync<{ value: string }>(
    "SELECT value FROM local_meta WHERE key = ?",
    EPOCH_KEY
  );
  return row?.value ?? null;
}

async function writeLocalEpoch(epoch: string) {
  await getChatDatabase().runAsync(
    "INSERT INTO local_meta (key, value) VALUES (?, ?) " +
      "ON CONFLICT(key) DO UPDATE SET value = excluded.value",
    EPOCH_KEY,
    epoch
  );
}

/** Server epoch, or null when offline / not available in time. */
async function fetchServerEpoch() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SERVER_TIMEOUT_MS);

  try {
    const { data, error } = await supabase
      .from("app_meta")
      .select("data_epoch")
      .limit(1)
      .abortSignal(controller.signal)
      .maybeSingle();

    if (error || !data) return null;
    return data.data_epoch as string;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** True only when the server confirms the session's user no longer exists. */
async function isSessionUserMissing() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return false;

  try {
    const { error } = await supabase.auth.getUser();
    if (!error || isAuthRetryableFetchError(error)) return false;
    return isDeletedUserAuthError(error);
  } catch {
    return false;
  }
}

/**
 * Empties every local table (cache, mutation queue, chat, offline logins)
 * and drops the saved Supabase session. `local_meta` is kept.
 */
export async function wipeLocalData() {
  const db = getChatDatabase();
  const tables = await db.getAllAsync<{ name: string }>(
    "SELECT name FROM sqlite_master WHERE type = 'table' " +
      "AND name NOT LIKE 'sqlite_%' AND name <> 'local_meta'"
  );

  await db.withTransactionAsync(async () => {
    for (const { name } of tables) {
      await db.execAsync(`DELETE FROM "${name.replace(/"/g, '""')}"`);
    }
  });

  try {
    await supabase.auth.signOut({ scope: "local" });
  } catch {
    // The session is removed from storage below either way.
  }
  await AsyncStorage.removeItem(SUPABASE_AUTH_STORAGE_KEY);
}

/**
 * Runs once at startup, before the session is restored. If the server data
 * was reset since this device last synced (or the saved user was deleted),
 * wipes the local replica so it refills from the server. Never wipes while
 * offline. Returns true when a wipe happened.
 */
export async function reconcileLocalDataWithServer() {
  try {
    const [localEpoch, serverEpoch, sessionUserMissing] = await Promise.all([
      readLocalEpoch(),
      fetchServerEpoch(),
      isSessionUserMissing(),
    ]);

    const decision = decideLocalReset({
      localEpoch,
      serverEpoch,
      sessionUserMissing,
    });

    if (decision === "wipe") {
      console.log("[offline] Server data changed: wiping local data", {
        localEpoch,
        serverEpoch,
        sessionUserMissing,
      });
      await wipeLocalData();
    }

    if (serverEpoch && decision !== "keep") {
      await writeLocalEpoch(serverEpoch);
    }

    return decision === "wipe";
  } catch (error) {
    // Never block startup on this check.
    console.log("[offline] Local data reconciliation failed:", error);
    return false;
  }
}
