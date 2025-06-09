import { View, FlatList, StyleSheet } from "react-native";
import { theme } from "@/theme/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useEffect } from "react";
import useList from "@/hooks/useList";
import NotificationCard from "./NotificationCard";
import Divider from "./ui/Divider";
import Text from "./ui/Text";
import Loader from "./ui/Loader";
import useMutate from "@/hooks/useMutate";

export default function NotificationList() {
  const [notifications, { status }] = useList("notification", {
    expand: "user",
    sort: "-created",
  });

  const { update } = useMutate("notification");

  useEffect(() => {
    if (status === "success" && notifications.length > 0) {
      notifications.forEach((notification) => {
        if (!notification.read) {
          update(notification.id, { read: true }).then((result) => {
            console.log(`Notification ${notification.id} marked as read`);
          });
        }
      });
    }
  }, [notifications, status]);

  if (status === "loading")
    return (
      <View style={{ padding: 40 }}>
        <Loader />
      </View>
    );

  if (status === "error") return <ErrorNotificationComponent />;

  return (
    <FlatList
      data={notifications}
      renderItem={({ item }) => <NotificationCard notification={item} />}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={EmptyListComponent}
      ItemSeparatorComponent={() => <Divider />}
    />
  );
}

function EmptyListComponent() {
  return (
    <View style={styles.centeredContainer}>
      <MaterialCommunityIcons
        name="bell-remove"
        size={44}
        color={theme.colors.lightGray}
        style={{ marginBottom: 12 }}
      />
      <Text
        fontFamily="bold"
        color={"white"}
        size={theme.fontSizes.lg + 1}
        style={{ marginBottom: 2 }}
      >
        No tienes notificaciones
      </Text>
      <Text
        color={theme.colors.lightGray}
        size={theme.fontSizes.md}
        style={{ textAlign: "center" }}
      >
        Cuando recibas una notificación, aparecerá aquí.
      </Text>
    </View>
  );
}

function ErrorNotificationComponent() {
  return (
    <View style={styles.centeredContainer}>
      <MaterialCommunityIcons
        name="alert-circle-outline"
        size={48}
        color={theme.colors.redError}
        style={{ marginBottom: 10 }}
      />
      <Text
        fontFamily="bold"
        size={theme.fontSizes.lg + 1}
        color={theme.colors.redError || "#FF6959"}
        style={{ marginBottom: 3 }}
      >
        No se pudieron cargar las notificaciones
      </Text>
      <Text
        style={{ textAlign: "center" }}
        color={theme.colors.lightGray}
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
    paddingHorizontal: 30,
    gap: 3,
    opacity: 0.92,
  },
});
