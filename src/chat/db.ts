import type { SQLiteDatabase } from "expo-sqlite";

let chatDatabase: SQLiteDatabase | null = null;

export async function initChatDatabase(db: SQLiteDatabase) {
  chatDatabase = db;

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    PRAGMA user_version = 1;

    CREATE TABLE IF NOT EXISTS chat_messages (
      local_id TEXT PRIMARY KEY NOT NULL,
      client_id TEXT NOT NULL UNIQUE,
      server_id TEXT,
      request_id TEXT NOT NULL,
      sender_id TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at_client TEXT NOT NULL,
      created_at_server TEXT,
      updated_at_server TEXT,
      sync_status TEXT NOT NULL,
      sync_error TEXT,
      retry_count INTEGER NOT NULL DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS idx_chat_messages_request_created
      ON chat_messages (request_id, created_at_client);

    CREATE UNIQUE INDEX IF NOT EXISTS idx_chat_messages_server_id
      ON chat_messages (server_id);

    CREATE TABLE IF NOT EXISTS chat_read_states (
      request_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      read_at_client TEXT NOT NULL,
      PRIMARY KEY (request_id, user_id)
    );

    CREATE INDEX IF NOT EXISTS idx_chat_read_states_user
      ON chat_read_states (user_id);
  `);
}

export function getChatDatabase() {
  if (!chatDatabase) {
    throw new Error("Chat database is not ready.");
  }

  return chatDatabase;
}
