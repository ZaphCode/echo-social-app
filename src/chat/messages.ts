import { Message } from "@/models/Message";
import { getChatDatabase } from "./db";
import { ChatMessage } from "./types";

type ChatMessageRow = {
  local_id: string;
  client_id: string;
  server_id: string | null;
  request_id: string;
  sender_id: string;
  content: string;
  created_at_client: string;
  created_at_server: string | null;
  updated_at_server: string | null;
  sync_status: ChatMessage["sync_status"];
  sync_error: string | null;
  retry_count: number;
};

type ChatReadStateRow = {
  request_id: string;
  user_id: string;
  read_at_client: string;
};

type PendingMessageInput = {
  localId: string;
  clientId: string;
  requestId: string;
  senderId: string;
  content: string;
  createdAtClient: string;
};

const getMessageSentAt = (message: ChatMessage) => message.created_at_client;

const sortBySentTimestamp = (a: ChatMessage, b: ChatMessage) => {
  return (
    new Date(getMessageSentAt(a)).getTime() -
    new Date(getMessageSentAt(b)).getTime()
  );
};

function mapRow(row: ChatMessageRow): ChatMessage {
  return {
    local_id: row.local_id,
    client_id: row.client_id,
    server_id: row.server_id,
    request_id: row.request_id,
    sender_id: row.sender_id,
    content: row.content,
    created_at_client: row.created_at_client,
    created_at_server: row.created_at_server,
    updated_at_server: row.updated_at_server,
    sync_status: row.sync_status,
    sync_error: row.sync_error,
    retry_count: row.retry_count,
  };
}

function createSyntheticClientId(message: Message) {
  return message.client_id ?? `remote:${message.id}`;
}

export async function listLocalMessagesByRequest(requestId: string) {
  const db = getChatDatabase();
  const rows = await db.getAllAsync<ChatMessageRow>(
    `
      SELECT *
      FROM chat_messages
      WHERE request_id = ?
      ORDER BY created_at_client ASC
    `,
    requestId
  );

  return rows.map(mapRow).sort(sortBySentTimestamp);
}

export async function getLatestLocalMessageTimestamp(requestId: string) {
  const db = getChatDatabase();
  const row = await db.getFirstAsync<{ latest_created_at_client: string }>(
    `
      SELECT MAX(created_at_client) AS latest_created_at_client
      FROM chat_messages
      WHERE request_id = ?
    `,
    requestId
  );

  return row?.latest_created_at_client ?? null;
}

export async function insertPendingMessage(input: PendingMessageInput) {
  const db = getChatDatabase();

  await db.runAsync(
    `
      INSERT INTO chat_messages (
        local_id,
        client_id,
        server_id,
        request_id,
        sender_id,
        content,
        created_at_client,
        created_at_server,
        updated_at_server,
        sync_status,
        sync_error,
        retry_count
      ) VALUES (?, ?, NULL, ?, ?, ?, ?, NULL, NULL, 'pending', NULL, 0)
    `,
    [
      input.localId,
      input.clientId,
      input.requestId,
      input.senderId,
      input.content,
      input.createdAtClient,
    ]
  );
}

export async function listPendingMessages() {
  const db = getChatDatabase();
  const rows = await db.getAllAsync<ChatMessageRow>(
    `
      SELECT *
      FROM chat_messages
      WHERE sync_status IN ('pending', 'failed')
      ORDER BY created_at_client ASC
    `
  );

  return rows.map(mapRow);
}

export async function markMessageSending(clientId: string) {
  const db = getChatDatabase();

  await db.runAsync(
    `
      UPDATE chat_messages
      SET sync_status = 'sending',
          sync_error = NULL
      WHERE client_id = ?
    `,
    clientId
  );
}

export async function markMessageSent(clientId: string, remoteMessage: Message) {
  const db = getChatDatabase();

  await db.runAsync(
    `
      UPDATE chat_messages
      SET server_id = ?,
          request_id = ?,
          sender_id = ?,
          content = ?,
          created_at_server = ?,
          updated_at_server = ?,
          sync_status = 'sent',
          sync_error = NULL
      WHERE client_id = ?
    `,
    [
      remoteMessage.id,
      remoteMessage.request,
      remoteMessage.sender,
      remoteMessage.content,
      remoteMessage.created_at,
      remoteMessage.updated_at,
      clientId,
    ]
  );
}

export async function markMessageFailed(clientId: string, errorMessage: string) {
  const db = getChatDatabase();

  await db.runAsync(
    `
      UPDATE chat_messages
      SET sync_status = 'failed',
          sync_error = ?,
          retry_count = retry_count + 1
      WHERE client_id = ?
    `,
    [errorMessage, clientId]
  );
}

export async function markMessagePending(clientId: string) {
  const db = getChatDatabase();

  await db.runAsync(
    `
      UPDATE chat_messages
      SET sync_status = 'pending',
          sync_error = NULL
      WHERE client_id = ?
    `,
    clientId
  );
}

export async function getMessageByClientId(clientId: string) {
  const db = getChatDatabase();
  const row = await db.getFirstAsync<ChatMessageRow>(
    `
      SELECT *
      FROM chat_messages
      WHERE client_id = ?
      LIMIT 1
    `,
    clientId
  );

  return row ? mapRow(row) : null;
}

export async function upsertRemoteMessageToLocal(remoteMessage: Message) {
  const db = getChatDatabase();
  const normalizedClientId = createSyntheticClientId(remoteMessage);
  const normalizedCreatedAtClient =
    remoteMessage.created_at_client ?? remoteMessage.created_at;

  const result = await db.runAsync(
    `
      INSERT INTO chat_messages (
        local_id,
        client_id,
        server_id,
        request_id,
        sender_id,
        content,
        created_at_client,
        created_at_server,
        updated_at_server,
        sync_status,
        sync_error,
        retry_count
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'sent', NULL, 0)
      ON CONFLICT(client_id) DO UPDATE SET
        server_id = excluded.server_id,
        request_id = excluded.request_id,
        sender_id = excluded.sender_id,
        content = excluded.content,
        created_at_client = excluded.created_at_client,
        created_at_server = excluded.created_at_server,
        updated_at_server = excluded.updated_at_server,
        sync_status = 'sent',
        sync_error = NULL
      WHERE chat_messages.server_id IS NOT excluded.server_id
         OR chat_messages.request_id IS NOT excluded.request_id
         OR chat_messages.sender_id IS NOT excluded.sender_id
         OR chat_messages.content IS NOT excluded.content
         OR chat_messages.created_at_client IS NOT excluded.created_at_client
         OR chat_messages.created_at_server IS NOT excluded.created_at_server
         OR chat_messages.updated_at_server IS NOT excluded.updated_at_server
         OR chat_messages.sync_status IS NOT 'sent'
         OR chat_messages.sync_error IS NOT NULL
    `,
    [
      `remote:${remoteMessage.id}`,
      normalizedClientId,
      remoteMessage.id,
      remoteMessage.request,
      remoteMessage.sender,
      remoteMessage.content,
      normalizedCreatedAtClient,
      remoteMessage.created_at,
      remoteMessage.updated_at,
    ]
  );

  return result.changes > 0;
}

export async function markRequestMessagesRead({
  requestId,
  userId,
  readAtClient,
}: {
  requestId: string;
  userId: string;
  readAtClient: string;
}) {
  const db = getChatDatabase();

  await db.runAsync(
    `
      INSERT INTO chat_read_states (
        request_id,
        user_id,
        read_at_client
      ) VALUES (?, ?, ?)
      ON CONFLICT(request_id, user_id) DO UPDATE SET
        read_at_client = CASE
          WHEN excluded.read_at_client > chat_read_states.read_at_client
            THEN excluded.read_at_client
          ELSE chat_read_states.read_at_client
        END
    `,
    [requestId, userId, readAtClient]
  );
}

export async function listReadStatesByUser(userId: string) {
  const db = getChatDatabase();
  const rows = await db.getAllAsync<ChatReadStateRow>(
    `
      SELECT *
      FROM chat_read_states
      WHERE user_id = ?
    `,
    userId
  );

  return rows.reduce<Record<string, string>>((acc, row) => {
    acc[row.request_id] = row.read_at_client;
    return acc;
  }, {});
}
