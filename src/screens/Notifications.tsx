import { useEffect, useMemo } from "react";
import { SectionList, StyleSheet, View } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  listNotificationsByUser,
  markNotificationAsRead,
  notificationsKeys,
} from "@/api/notifications";
import { NotificationWithUser } from "@/api/types";
import NotificationCard from "@/components/NotificationCard";
import EmptyState from "@/components/ui/EmptyState";
import Loader from "@/components/ui/Loader";
import Text from "@/components/ui/Text";
import { useAuthCtx } from "@/context/Auth";
import useTheme from "@/hooks/useTheme";
import { space } from "@/theme/theme";

const DAY_MS = 24 * 60 * 60 * 1000;

function groupByRecency(notifications: NotificationWithUser[]) {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const today = startOfToday.getTime();
  const groups = [
    { title: "Hoy", data: [] as NotificationWithUser[] },
    { title: "Esta semana", data: [] as NotificationWithUser[] },
    { title: "Anteriores", data: [] as NotificationWithUser[] },
  ];

  for (const notification of notifications) {
    const time = new Date(notification.created_at).getTime();
    const index = time >= today ? 0 : time >= today - 6 * DAY_MS ? 1 : 2;
    groups[index].data.push(notification);
  }

  return groups.filter((group) => group.data.length > 0);
}

export default function Notifications() {
  const { user } = useAuthCtx();
  const { colors } = useTheme();
  const queryClient = useQueryClient();
  const notificationsQuery = useQuery({
    queryKey: notificationsKeys.byUser(user.id),
    queryFn: () => listNotificationsByUser(user.id),
  });
  const { mutateAsync: markAsRead } = useMutation({ mutationFn: markNotificationAsRead });

  const notifications = useMemo(
    () => notificationsQuery.data?.filter((item) => item.user === user.id) ?? [],
    [notificationsQuery.data, user.id],
  );
  const sections = useMemo(() => groupByRecency(notifications), [notifications]);

  // Opening the inbox marks everything as read; the unread styling stays
  // visible for this visit because we only refetch the badge count.
  useEffect(() => {
    const unreadIds = notifications.filter((item) => !item.read).map((item) => item.id);
    if (!notificationsQuery.isSuccess || unreadIds.length === 0) return;

    Promise.all(unreadIds.map((id) => markAsRead(id))).then(() =>
      queryClient.invalidateQueries({ queryKey: notificationsKeys.unreadCount(user.id) }),
    );
  }, [markAsRead, notifications, notificationsQuery.isSuccess, queryClient, user.id]);

  if (notificationsQuery.isPending) {
    return (
      <View style={[styles.fill, { backgroundColor: colors.bg }]}>
        <Loader />
      </View>
    );
  }

  return (
    <SectionList
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={styles.content}
      sections={sections}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <NotificationCard notification={item} />}
      renderSectionHeader={({ section }) => (
        <Text variant="label" bold tone="subtle" style={styles.sectionTitle}>
          {section.title.toUpperCase()}
        </Text>
      )}
      stickySectionHeadersEnabled={false}
      ItemSeparatorComponent={() => <View style={{ height: 6 }} />}
      ListEmptyComponent={
        notificationsQuery.isError ? (
          <EmptyState
            tone="error"
            icon="alert-circle"
            title="No pudimos cargar tus notificaciones"
            message="Revisa tu conexión e intenta de nuevo."
            action={{ label: "Reintentar", onPress: () => notificationsQuery.refetch() }}
          />
        ) : (
          <EmptyState
            icon="bell"
            title="Todo al día"
            message="Aquí verás nuevas solicitudes, ofertas y valoraciones."
          />
        )
      }
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: space.md,
    paddingBottom: space.xl,
  },
  sectionTitle: {
    letterSpacing: 0.6,
    paddingHorizontal: 4,
    paddingTop: space.md,
    paddingBottom: space.xs,
  },
});
