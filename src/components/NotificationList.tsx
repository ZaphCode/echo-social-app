import { View, FlatList, StyleSheet } from "react-native";
import { theme } from "@/theme/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  listNotificationsByUser,
  markNotificationAsRead,
  notificationsKeys,
} from "@/api/notifications";
import { useAuthCtx } from "@/context/Auth";
import { useEffect } from "react";
import NotificationCard from "./NotificationCard";
import Divider from "./ui/Divider";
import Text from "./ui/Text";
import Loader from "./ui/Loader";
import useColorScheme from "@/hooks/useColorScheme";

export default function NotificationList() {
  const { user } = useAuthCtx();
  const queryClient = useQueryClient();
  const notificationsQuery = useQuery({
    queryKey: notificationsKeys.byUser(user.id),
    queryFn: () => listNotificationsByUser(user.id),
  });

  const readMutation = useMutation({
    mutationFn: markNotificationAsRead,
  });
  const { mutateAsync: markAsRead } = readMutation;

  useEffect(() => {
    const notifications = notificationsQuery.data ?? [];
    const unreadIds = notifications
      .filter((notification) => !notification.read)
      .map((notification) => notification.id);

    if (notificationsQuery.isSuccess && unreadIds.length > 0) {
      Promise.all(unreadIds.map((id) => markAsRead(id))).then(() =>
        queryClient.invalidateQueries({
          queryKey: notificationsKeys.byUser(user.id),
        })
      );
    }
  }, [markAsRead, notificationsQuery.data, notificationsQuery.isSuccess, queryClient, user.id]);

  if (notificationsQuery.isPending)
    return (
      <View style={{ padding: 40 }}>
        <Loader />
      </View>
    );

  if (notificationsQuery.isError) return <ErrorNotificationComponent />;

  return (
    <FlatList
      data={notificationsQuery.data}
      renderItem={({ item }) => <NotificationCard notification={item} />}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={EmptyListComponent}
      ItemSeparatorComponent={() => <Divider />}
    />
  );
}

function EmptyListComponent() {
  const { colors } = useColorScheme();

  return (
    <View style={styles.centeredContainer}>
      <MaterialCommunityIcons
        name="bell-remove"
        size={44}
        color={colors.lightGray}
        style={{ marginBottom: 12 }}
      />
      <Text
        fontFamily="bold"
        color={colors.text}
        size={theme.fontSizes.lg + 1}
        style={{ marginBottom: 2 }}
      >
        No tienes notificaciones
      </Text>
      <Text
        color={colors.lightGray}
        size={theme.fontSizes.md}
        style={{ textAlign: "center" }}
      >
        Cuando recibas una notificación, aparecerá aquí.
      </Text>
    </View>
  );
}

function ErrorNotificationComponent() {
  const { colors } = useColorScheme();

  return (
    <View style={styles.centeredContainer}>
      <MaterialCommunityIcons
        name="alert-circle-outline"
        size={48}
        color={colors.redError}
        style={{ marginBottom: 10 }}
      />
      <Text
        fontFamily="bold"
        size={theme.fontSizes.lg}
        color={colors.text}
        style={{ marginBottom: 3, textAlign: "center" }}
      >
        Error al cargar las notificaciones
      </Text>
      <Text
        style={{ textAlign: "center" }}
        color={colors.lightGray}
        size={theme.fontSizes.md}
      >
        Revisa tu conexión e intenta de nuevo.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  centeredContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 54,
    paddingBottom: 30,
    paddingHorizontal: 16,
    gap: 3,
    opacity: 0.92,
  },
});
