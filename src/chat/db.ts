import type { SQLiteDatabase } from "expo-sqlite";

let chatDatabase: SQLiteDatabase | null = null;

export async function initChatDatabase(db: SQLiteDatabase) {
  chatDatabase = db;
  const versionRow = await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version"
  );
  const currentVersion = versionRow?.user_version ?? 0;

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

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

    CREATE TABLE IF NOT EXISTS local_auth_users (
      user_id TEXT PRIMARY KEY NOT NULL,
      email TEXT NOT NULL UNIQUE,
      profile_json TEXT NOT NULL,
      last_online_at TEXT,
      last_auth_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS local_profiles (
      id TEXT PRIMARY KEY NOT NULL,
      email TEXT,
      role TEXT,
      updated_at TEXT,
      payload_json TEXT NOT NULL,
      cached_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_local_profiles_email
      ON local_profiles (email);

    CREATE TABLE IF NOT EXISTS local_categories (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      cached_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS local_services (
      id TEXT PRIMARY KEY NOT NULL,
      provider TEXT NOT NULL,
      category TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      cached_at TEXT NOT NULL,
      visited_at TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_local_services_category
      ON local_services (category);

    CREATE INDEX IF NOT EXISTS idx_local_services_provider
      ON local_services (provider);

    CREATE TABLE IF NOT EXISTS local_contractings (
      id TEXT PRIMARY KEY NOT NULL,
      owner TEXT NOT NULL,
      category TEXT NOT NULL,
      name TEXT NOT NULL,
      is_closed INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      cached_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_local_contractings_category
      ON local_contractings (category);

    CREATE INDEX IF NOT EXISTS idx_local_contractings_owner
      ON local_contractings (owner);

    CREATE TABLE IF NOT EXISTS local_service_requests (
      id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      client TEXT NOT NULL,
      provider TEXT NOT NULL,
      service TEXT,
      contracting TEXT,
      agreement_state TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      base_updated_at TEXT,
      dirty_status TEXT,
      payload_json TEXT NOT NULL,
      cached_at TEXT NOT NULL,
      PRIMARY KEY (id, user_id)
    );

    CREATE INDEX IF NOT EXISTS idx_local_service_requests_user
      ON local_service_requests (user_id, updated_at);

    CREATE INDEX IF NOT EXISTS idx_local_service_requests_service_client
      ON local_service_requests (service, client);

    CREATE INDEX IF NOT EXISTS idx_local_service_requests_contracting_provider
      ON local_service_requests (contracting, provider);

    CREATE TABLE IF NOT EXISTS local_notifications (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL,
      read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      dirty_status TEXT,
      payload_json TEXT NOT NULL,
      cached_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_local_notifications_user_created
      ON local_notifications (user_id, created_at);

    CREATE TABLE IF NOT EXISTS local_reviews (
      id TEXT PRIMARY KEY NOT NULL,
      service TEXT,
      contracting TEXT,
      reviewer TEXT NOT NULL,
      reviewed TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      cached_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_local_reviews_service
      ON local_reviews (service);

    CREATE INDEX IF NOT EXISTS idx_local_reviews_reviewer_service
      ON local_reviews (reviewer, service);

    CREATE INDEX IF NOT EXISTS idx_local_reviews_reviewer_contracting
      ON local_reviews (reviewer, contracting);

    CREATE TABLE IF NOT EXISTS offline_mutation_queue (
      id TEXT PRIMARY KEY NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      action TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      base_updated_at TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      error TEXT,
      retry_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_offline_mutation_queue_status_created
      ON offline_mutation_queue (status, created_at);
  `);

  if (currentVersion < 3) {
    await db.execAsync(`
      ALTER TABLE local_service_requests RENAME TO local_service_requests_legacy;

      CREATE TABLE local_service_requests (
        id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        client TEXT NOT NULL,
        provider TEXT NOT NULL,
        service TEXT,
        contracting TEXT,
        agreement_state TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        base_updated_at TEXT,
        dirty_status TEXT,
        payload_json TEXT NOT NULL,
        cached_at TEXT NOT NULL,
        PRIMARY KEY (id, user_id)
      );

      INSERT OR REPLACE INTO local_service_requests (
        id,
        user_id,
        client,
        provider,
        service,
        contracting,
        agreement_state,
        updated_at,
        base_updated_at,
        dirty_status,
        payload_json,
        cached_at
      )
      SELECT
        id,
        user_id,
        client,
        provider,
        service,
        contracting,
        agreement_state,
        updated_at,
        base_updated_at,
        dirty_status,
        payload_json,
        cached_at
      FROM local_service_requests_legacy;

      DROP TABLE local_service_requests_legacy;

      CREATE INDEX IF NOT EXISTS idx_local_service_requests_user
        ON local_service_requests (user_id, updated_at);

      CREATE INDEX IF NOT EXISTS idx_local_service_requests_service_client
        ON local_service_requests (service, client);

      CREATE INDEX IF NOT EXISTS idx_local_service_requests_contracting_provider
        ON local_service_requests (contracting, provider);

      PRAGMA user_version = 3;
    `);
  }
}

export function getChatDatabase() {
  if (!chatDatabase) {
    throw new Error("Chat database is not ready.");
  }

  return chatDatabase;
}
