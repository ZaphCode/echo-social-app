import { View, FlatList, StyleSheet } from "react-native";
import { theme } from "@/theme/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import useList from "@/hooks/useList";
import NotificationCard from "./NotificationCard";
import Divider from "./ui/Divider";
import Text from "./ui/Text";

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

  return (
    <FlatList
      data={notifications}
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
        size={32}
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
    backgroundColor: theme.colors.darkerGray,
    borderRadius: theme.spacing.md,
    gap: theme.spacing.sm,
    justifyContent: "center",
    marginTop: 10,
    alignItems: "center",
    padding: theme.spacing.md,
  },
});
