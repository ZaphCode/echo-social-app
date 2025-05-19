import { View, FlatList, StyleSheet } from "react-native";
import React from "react";
import useList from "@/hooks/useList";
import NotificationCard from "./NotificationCard";
import { theme } from "@/theme/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Divider from "./ui/Divider";
import Text from "./ui/Text";
import { mockNotifications } from "@/utils/testing";

export default function NotificationList() {
  const [notifications, { status, error }] = useList("notification", {
    expand: "user",
  });

  if (status === "loading") {
    return (
      <View style={styles.emptyListContainer}>
        <MaterialCommunityIcons
          name="bell-alert"
          size={30}
          color={theme.colors.lightGray}
        />
        <Text size={theme.fontSizes.lg}>Cargando notificaciones...</Text>
      </View>
    );
  }

  // if (status === "error") {
  //   return (
  //     <View style={styles.emptyListContainer}>
  //       <MaterialCommunityIcons
  //         name="bell-off"
  //         size={30}
  //         color={theme.colors.redError}
  //       />
  //       <Text color={theme.colors.redError} size={theme.fontSizes.lg}>
  //         {`Error al cargar notificaciones. ${error}`}
  //       </Text>
  //     </View>
  //   );
  // }

  return (
    <FlatList
      // TODO: Remove this mocking when the API is ready
      data={notifications.length > 0 ? notifications : mockNotifications}
      renderItem={({ item }) => <NotificationCard notification={item} />}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
      ListEmptyComponent={EmptyListComponent}
      ItemSeparatorComponent={() => <Divider />}
    />
  );
}

function EmptyListComponent() {
  return (
    <View style={styles.emptyListContainer}>
      <MaterialCommunityIcons
        name="bell-remove"
        size={30}
        color={theme.colors.lightGray}
      />
      <Text size={theme.fontSizes.lg}>No tienes notificaciones</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: theme.spacing.sm,
  },
  emptyListContainer: {
    gap: theme.spacing.sm,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",

    padding: theme.spacing.lg,
  },
});
