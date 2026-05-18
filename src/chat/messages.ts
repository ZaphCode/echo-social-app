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
}
