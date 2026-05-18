export type ChatSyncStatus = "pending" | "sending" | "sent" | "failed";

export type ChatMessage = {
  local_id: string;
  client_id: string;
  server_id: string | null;
  request_id: string;
  sender_id: string;
  content: string;
  created_at_client: string;
  created_at_server: string | null;
  updated_at_server: string | null;
  sync_status: ChatSyncStatus;
  sync_error: string | null;
  retry_count: number;
};
