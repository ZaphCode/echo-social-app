import { Category } from "@/models/Category";
import { Notification } from "@/models/Notification";
import { User } from "@/models/User";
import {
  ContractingWithOwner,
  NotificationWithUser,
  ReviewWithProfiles,
  ServiceRequestWithRelations,
  ServiceWithProvider,
  ServiceWithProviderAndCategory,
} from "@/api/types";
import { getChatDatabase } from "@/chat/db";
import { createLocalUuid } from "./ids";

type PayloadRow = {
  payload_json: string;
};

const mutationQueueListeners = new Set<() => void>();

export type OfflineMutation = {
  id: string;
  entity_type: "service_request" | "notification";
  entity_id: string;
  action:
    | "service_request_create"
    | "service_request_update"
    | "notification_create"
    | "notification_mark_read";
  payload_json: string;
  base_updated_at: string | null;
  status: "pending" | "syncing" | "failed" | "conflict" | "sent";
  error: string | null;
  retry_count: number;
  created_at: string;
  updated_at: string;
};

function nowIso() {
  return new Date().toISOString();
}

function stringifyPayload(value: unknown) {
  return JSON.stringify(value ?? null);
}

function parsePayload<T>(row: PayloadRow): T {
  return JSON.parse(row.payload_json) as T;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function toSqlBool(value: boolean) {
  return value ? 1 : 0;
}

function notifyMutationQueueListeners() {
  mutationQueueListeners.forEach((listener) => listener());
}

export function subscribeOfflineMutationQueue(listener: () => void) {
  mutationQueueListeners.add(listener);
  return () => {
    mutationQueueListeners.delete(listener);
  };
}

export async function cacheAuthUser(user: User, online = false) {
  const db = getChatDatabase();
  const cachedAt = nowIso();

  await cacheProfile(user);
  await db.runAsync(
    `
      INSERT INTO local_auth_users (
        user_id,
        email,
        profile_json,
        last_online_at,
        last_auth_at
      ) VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        email = excluded.email,
        profile_json = excluded.profile_json,
        last_online_at = COALESCE(excluded.last_online_at, local_auth_users.last_online_at),
        last_auth_at = excluded.last_auth_at
    `,
    [
      user.id,
      normalizeEmail(user.email),
      stringifyPayload(user),
      online ? cachedAt : null,
      cachedAt,
    ]
  );
}

export async function getCachedAuthUserById(userId: string) {
  const db = getChatDatabase();
  const row = await db.getFirstAsync<PayloadRow>(
    `
      SELECT profile_json AS payload_json
      FROM local_auth_users
      WHERE user_id = ?
      LIMIT 1
    `,
    userId
  );

  return row ? parsePayload<User>(row) : null;
}

export async function getCachedAuthUserByEmail(email: string) {
  const db = getChatDatabase();
  const row = await db.getFirstAsync<PayloadRow>(
    `
      SELECT profile_json AS payload_json
      FROM local_auth_users
      WHERE email = ?
      LIMIT 1
    `,
    normalizeEmail(email)
  );

  return row ? parsePayload<User>(row) : null;
}

export async function cacheProfile(user: User) {
  const db = getChatDatabase();
  await db.runAsync(
    `
      INSERT INTO local_profiles (
        id,
        email,
        role,
        updated_at,
        payload_json,
        cached_at
      ) VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        email = excluded.email,
        role = excluded.role,
        updated_at = excluded.updated_at,
        payload_json = excluded.payload_json,
        cached_at = excluded.cached_at
    `,
    [
      user.id,
      normalizeEmail(user.email),
      user.role,
      user.updated_at,
      stringifyPayload(user),
      nowIso(),
    ]
  );
}

export async function getCachedProfile(userId: string) {
  const db = getChatDatabase();
  const row = await db.getFirstAsync<PayloadRow>(
    `
      SELECT payload_json
      FROM local_profiles
      WHERE id = ?
      LIMIT 1
    `,
    userId
  );

  return row ? parsePayload<User>(row) : null;
}

export async function cacheCategories(categories: Category[]) {
  const db = getChatDatabase();
  const cachedAt = nowIso();

  for (const category of categories) {
    await db.runAsync(
      `
        INSERT INTO local_categories (id, name, payload_json, cached_at)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          name = excluded.name,
          payload_json = excluded.payload_json,
          cached_at = excluded.cached_at
      `,
      [category.id, category.name, stringifyPayload(category), cachedAt]
    );
  }
}

export async function listCachedCategories() {
  const db = getChatDatabase();
  const rows = await db.getAllAsync<PayloadRow>(
    `
      SELECT payload_json
      FROM local_categories
      ORDER BY name ASC
    `
  );

  return rows.map((row) => parsePayload<Category>(row));
}

export async function cacheServices(
  services: ServiceWithProvider[],
  options: { visited?: boolean } = {}
) {
  const db = getChatDatabase();
  const cachedAt = nowIso();

  for (const service of services) {
    if (service.provider_profile) {
      await cacheProfile(service.provider_profile);
    }

    await db.runAsync(
      `
        INSERT INTO local_services (
          id,
          provider,
          category,
          name,
          description,
          updated_at,
          payload_json,
          cached_at,
          visited_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          provider = excluded.provider,
          category = excluded.category,
          name = excluded.name,
          description = excluded.description,
          updated_at = excluded.updated_at,
          payload_json = excluded.payload_json,
          cached_at = excluded.cached_at,
          visited_at = COALESCE(excluded.visited_at, local_services.visited_at)
      `,
      [
        service.id,
        service.provider,
        service.category,
        service.name,
        service.description,
        service.updated_at,
        stringifyPayload(service),
        cachedAt,
        options.visited ? cachedAt : null,
      ]
    );
  }
}

export async function markServiceVisited(service: ServiceWithProvider) {
  await cacheServices([service], { visited: true });
}

export async function listCachedServicesByCategory(categoryId: string) {
  const db = getChatDatabase();
  const rows = await db.getAllAsync<PayloadRow>(
    `
      SELECT payload_json
      FROM local_services
      WHERE (? = 'all' OR category = ? OR visited_at IS NOT NULL)
      ORDER BY cached_at DESC
    `,
    [categoryId, categoryId]
  );

  return rows.map((row) => parsePayload<ServiceWithProvider>(row));
}

export async function searchCachedServices(search: string) {
  const db = getChatDatabase();
  const normalized = `%${search.trim().toLowerCase()}%`;
  const rows = await db.getAllAsync<PayloadRow>(
    `
      SELECT payload_json
      FROM local_services
      WHERE lower(name) LIKE ?
         OR lower(description) LIKE ?
      ORDER BY cached_at DESC
    `,
    [normalized, normalized]
  );

  return rows.map((row) => parsePayload<ServiceWithProviderAndCategory>(row));
}

export async function getCachedService(serviceId: string) {
  const db = getChatDatabase();
  const row = await db.getFirstAsync<PayloadRow>(
    `
      SELECT payload_json
      FROM local_services
      WHERE id = ?
      LIMIT 1
    `,
    serviceId
  );

  return row ? parsePayload<ServiceWithProvider>(row) : null;
}

export async function cacheContractings(contractings: ContractingWithOwner[]) {
  const db = getChatDatabase();
  const cachedAt = nowIso();

  for (const contracting of contractings) {
    if (contracting.owner_profile) {
      await cacheProfile(contracting.owner_profile);
    }

    await db.runAsync(
      `
        INSERT INTO local_contractings (
          id,
          owner,
          category,
          name,
          is_closed,
          updated_at,
          payload_json,
          cached_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          owner = excluded.owner,
          category = excluded.category,
          name = excluded.name,
          is_closed = excluded.is_closed,
          updated_at = excluded.updated_at,
          payload_json = excluded.payload_json,
          cached_at = excluded.cached_at
      `,
      [
        contracting.id,
        contracting.owner,
        contracting.category,
        contracting.name,
        toSqlBool(contracting.is_closed),
        contracting.updated_at,
        stringifyPayload(contracting),
        cachedAt,
      ]
    );
  }
}

export async function listCachedContractingsByCategory(
  categoryId: string,
  userId: string
) {
  const db = getChatDatabase();
  const rows = await db.getAllAsync<PayloadRow>(
    `
      SELECT payload_json
      FROM local_contractings
      WHERE (? = 'all' OR category = ?)
        AND (is_closed = 0 OR owner = ?)
      ORDER BY is_closed ASC, cached_at DESC
    `,
    [categoryId, categoryId, userId]
  );

  return rows.map((row) => parsePayload<ContractingWithOwner>(row));
}

export async function getCachedContracting(contractingId: string) {
  const db = getChatDatabase();
  const row = await db.getFirstAsync<PayloadRow>(
    `
      SELECT payload_json
      FROM local_contractings
      WHERE id = ?
      LIMIT 1
    `,
    contractingId
  );

  return row ? parsePayload<ContractingWithOwner>(row) : null;
}

export async function cacheServiceRequests(
  userId: string,
  requests: ServiceRequestWithRelations[],
  options: { dirtyStatus?: string; baseUpdatedAt?: string | null } = {}
) {
  const db = getChatDatabase();
  const cachedAt = nowIso();

  for (const request of requests) {
    if (request.client_profile) await cacheProfile(request.client_profile);
    if (request.provider_profile) await cacheProfile(request.provider_profile);
    if (request.service_detail) await cacheServices([request.service_detail]);
    if (request.contracting_detail) {
      await cacheContractings([request.contracting_detail]);
    }

    await db.runAsync(
      `
        INSERT INTO local_service_requests (
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
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id, user_id) DO UPDATE SET
          client = excluded.client,
          provider = excluded.provider,
          service = excluded.service,
          contracting = excluded.contracting,
          agreement_state = excluded.agreement_state,
          updated_at = excluded.updated_at,
          base_updated_at = excluded.base_updated_at,
          dirty_status = excluded.dirty_status,
          payload_json = excluded.payload_json,
          cached_at = excluded.cached_at
      `,
      [
        request.id,
        userId,
        request.client,
        request.provider,
        request.service ?? null,
        request.contracting ?? null,
        request.agreement_state,
        request.updated_at,
        options.baseUpdatedAt ?? request.updated_at,
        options.dirtyStatus ?? null,
        stringifyPayload(request),
        cachedAt,
      ]
    );
  }
}

export async function listCachedServiceRequestsForUser(userId: string) {
  const db = getChatDatabase();
  const rows = await db.getAllAsync<PayloadRow>(
    `
      SELECT payload_json
      FROM local_service_requests
      WHERE user_id = ?
        AND (client = ? OR provider = ?)
      ORDER BY updated_at DESC
    `,
    [userId, userId, userId]
  );

  return rows
    .map((row) => parsePayload<ServiceRequestWithRelations>(row))
    .filter((request) => request.client === userId || request.provider === userId);
}

export async function listCachedServiceRequestsForServiceClient(
  serviceId: string,
  clientId: string
) {
  const db = getChatDatabase();
  const rows = await db.getAllAsync<PayloadRow>(
    `
      SELECT payload_json
      FROM local_service_requests
      WHERE user_id = ?
        AND service = ?
        AND client = ?
      ORDER BY updated_at DESC
    `,
    [clientId, serviceId, clientId]
  );

  return rows
    .map((row) => parsePayload<ServiceRequestWithRelations>(row))
    .filter((request) => request.client === clientId);
}

export async function listCachedServiceRequestsForContractingProvider(
  contractingId: string,
  providerId: string
) {
  const db = getChatDatabase();
  const rows = await db.getAllAsync<PayloadRow>(
    `
      SELECT payload_json
      FROM local_service_requests
      WHERE user_id = ?
        AND contracting = ?
        AND provider = ?
      ORDER BY updated_at DESC
    `,
    [providerId, contractingId, providerId]
  );

  return rows
    .map((row) => parsePayload<ServiceRequestWithRelations>(row))
    .filter((request) => request.provider === providerId);
}

export async function getCachedServiceRequest(requestId: string) {
  const db = getChatDatabase();
  const row = await db.getFirstAsync<PayloadRow>(
    `
      SELECT payload_json
      FROM local_service_requests
      WHERE id = ?
      LIMIT 1
    `,
    requestId
  );

  return row ? parsePayload<ServiceRequestWithRelations>(row) : null;
}

export async function cacheNotifications(
  userId: string,
  notifications: NotificationWithUser[],
  options: { dirtyStatus?: string } = {}
) {
  const db = getChatDatabase();
  const cachedAt = nowIso();

  for (const notification of notifications) {
    if (notification.user_profile) await cacheProfile(notification.user_profile);

    await db.runAsync(
      `
        INSERT INTO local_notifications (
          id,
          user_id,
          read,
          created_at,
          updated_at,
          dirty_status,
          payload_json,
          cached_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          user_id = excluded.user_id,
          read = excluded.read,
          created_at = excluded.created_at,
          updated_at = excluded.updated_at,
          dirty_status = excluded.dirty_status,
          payload_json = excluded.payload_json,
          cached_at = excluded.cached_at
      `,
      [
        notification.id,
        userId,
        toSqlBool(notification.read),
        notification.created_at,
        notification.updated_at,
        options.dirtyStatus ?? null,
        stringifyPayload(notification),
        cachedAt,
      ]
    );
  }
}

export async function listCachedNotifications(userId: string) {
  const db = getChatDatabase();
  const rows = await db.getAllAsync<PayloadRow>(
    `
      SELECT payload_json
      FROM local_notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
    `,
    userId
  );

  return rows
    .map((row) => parsePayload<NotificationWithUser>(row))
    .filter((notification) => notification.user === userId);
}

export async function countCachedUnreadNotifications(userId: string) {
  const db = getChatDatabase();
  const row = await db.getFirstAsync<{ unread_count: number }>(
    `
      SELECT COUNT(*) AS unread_count
      FROM local_notifications
      WHERE user_id = ?
        AND read = 0
    `,
    userId
  );

  return row?.unread_count ?? 0;
}

export async function markCachedNotificationRead(notificationId: string) {
  const notification = await getCachedNotification(notificationId);
  if (!notification) return null;

  const updated: NotificationWithUser = {
    ...notification,
    read: true,
    updated_at: nowIso(),
  };

  await cacheNotifications(updated.user, [updated], { dirtyStatus: "pending" });
  return updated;
}

export async function getCachedNotification(notificationId: string) {
  const db = getChatDatabase();
  const row = await db.getFirstAsync<PayloadRow>(
    `
      SELECT payload_json
      FROM local_notifications
      WHERE id = ?
      LIMIT 1
    `,
    notificationId
  );

  return row ? parsePayload<NotificationWithUser>(row) : null;
}

export async function cacheReviews(reviews: ReviewWithProfiles[]) {
  const db = getChatDatabase();
  const cachedAt = nowIso();

  for (const review of reviews) {
    await cacheProfile(review.reviewer_profile);
    await cacheProfile(review.reviewed_profile);
    await db.runAsync(
      `
        INSERT INTO local_reviews (
          id,
          service,
          contracting,
          reviewer,
          reviewed,
          updated_at,
          payload_json,
          cached_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          service = excluded.service,
          contracting = excluded.contracting,
          reviewer = excluded.reviewer,
          reviewed = excluded.reviewed,
          updated_at = excluded.updated_at,
          payload_json = excluded.payload_json,
          cached_at = excluded.cached_at
      `,
      [
        review.id,
        review.service ?? null,
        review.contracting ?? null,
        review.reviewer,
        review.reviewed,
        review.updated_at,
        stringifyPayload(review),
        cachedAt,
      ]
    );
  }
}

export async function listCachedServiceReviews(serviceId: string) {
  const db = getChatDatabase();
  const rows = await db.getAllAsync<PayloadRow>(
    `
      SELECT payload_json
      FROM local_reviews
      WHERE service = ?
      ORDER BY cached_at DESC
    `,
    serviceId
  );

  return rows.map((row) => parsePayload<ReviewWithProfiles>(row));
}

export async function listCachedReviewsByReviewerAndService(
  reviewerId: string,
  serviceId: string
) {
  const db = getChatDatabase();
  const rows = await db.getAllAsync<PayloadRow>(
    `
      SELECT payload_json
      FROM local_reviews
      WHERE reviewer = ?
        AND service = ?
    `,
    [reviewerId, serviceId]
  );

  return rows.map((row) => parsePayload<ReviewWithProfiles>(row));
}

export async function listCachedReviewsByReviewerAndContracting(
  reviewerId: string,
  contractingId: string
) {
  const db = getChatDatabase();
  const rows = await db.getAllAsync<PayloadRow>(
    `
      SELECT payload_json
      FROM local_reviews
      WHERE reviewer = ?
        AND contracting = ?
    `,
    [reviewerId, contractingId]
  );

  return rows.map((row) => parsePayload<ReviewWithProfiles>(row));
}

export async function enqueueOfflineMutation(input: {
  entityType: OfflineMutation["entity_type"];
  entityId: string;
  action: OfflineMutation["action"];
  payload: unknown;
  baseUpdatedAt?: string | null;
}) {
  const db = getChatDatabase();
  const timestamp = nowIso();
  const id = createLocalUuid();

  await db.runAsync(
    `
      INSERT INTO offline_mutation_queue (
        id,
        entity_type,
        entity_id,
        action,
        payload_json,
        base_updated_at,
        status,
        error,
        retry_count,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'pending', NULL, 0, ?, ?)
    `,
    [
      id,
      input.entityType,
      input.entityId,
      input.action,
      stringifyPayload(input.payload),
      input.baseUpdatedAt ?? null,
      timestamp,
      timestamp,
    ]
  );

  notifyMutationQueueListeners();

  return id;
}

export async function listPendingOfflineMutations() {
  const db = getChatDatabase();
  return db.getAllAsync<OfflineMutation>(
    `
      SELECT *
      FROM offline_mutation_queue
      WHERE status IN ('pending', 'failed')
      ORDER BY created_at ASC
    `
  );
}

export async function countPendingOfflineMutations() {
  const db = getChatDatabase();
  const row = await db.getFirstAsync<{ pending_count: number }>(
    `
      SELECT COUNT(*) AS pending_count
      FROM offline_mutation_queue
      WHERE status IN ('pending', 'failed', 'conflict')
    `
  );

  return row?.pending_count ?? 0;
}

export async function markOfflineMutationStatus(
  id: string,
  status: OfflineMutation["status"],
  error?: string | null
) {
  const db = getChatDatabase();
  await db.runAsync(
    `
      UPDATE offline_mutation_queue
      SET status = ?,
          error = ?,
          retry_count = CASE
            WHEN ? = 'failed' THEN retry_count + 1
            ELSE retry_count
          END,
          updated_at = ?
      WHERE id = ?
    `,
    [status, error ?? null, status, nowIso(), id]
  );

  notifyMutationQueueListeners();
}

export function createOfflineNotification(
  input: Pick<Notification, "user" | "message" | "type" | "read"> &
    Partial<Pick<Notification, "request" | "service" | "contracting">>
): NotificationWithUser {
  const timestamp = nowIso();
  return {
    id: createLocalUuid(),
    user: input.user,
    message: input.message,
    type: input.type,
    read: input.read,
    request: input.request,
    service: input.service,
    contracting: input.contracting,
    created_at: timestamp,
    updated_at: timestamp,
    user_profile: null,
  };
}
