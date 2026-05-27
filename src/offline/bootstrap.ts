import { QueryClient } from "@tanstack/react-query";

import { categoriesKeys, listServiceCategories } from "@/api/categories";
import {
  countUnreadNotificationsByUser,
  listNotificationsByUser,
  notificationsKeys,
} from "@/api/notifications";
import {
  listAllUserRequests,
  serviceRequestsKeys,
} from "@/api/serviceRequests";

export async function bootstrapOfflineCacheForUser(
  userId: string,
  queryClient: QueryClient
) {
  const [requestsResult, notificationsResult, unreadResult, categoriesResult] =
    await Promise.allSettled([
      listAllUserRequests(userId),
      listNotificationsByUser(userId),
      countUnreadNotificationsByUser(userId),
      listServiceCategories(),
    ]);

  if (requestsResult.status === "fulfilled") {
    queryClient.setQueryData(
      serviceRequestsKeys.allForUser(userId),
      requestsResult.value
    );
  }

  if (notificationsResult.status === "fulfilled") {
    queryClient.setQueryData(
      notificationsKeys.byUser(userId),
      notificationsResult.value
    );
  }

  if (unreadResult.status === "fulfilled") {
    queryClient.setQueryData(
      notificationsKeys.unreadCount(userId),
      unreadResult.value
    );
  }

  if (categoriesResult.status === "fulfilled") {
    queryClient.setQueryData(categoriesKeys.all, categoriesResult.value);
  }
}
