import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, View } from "react-native";

import { theme } from "@/theme/theme";
import NotificationList from "@/components/NotificationList";
import Divider from "@/components/ui/Divider";
import useColorScheme from "@/hooks/useColorScheme";
import Title from "@/components/ui/Title";

export default function Notifications() {
  const { colors } = useColorScheme();

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <Title title="Notificaciones" />
        <Divider />
      </View>
      <NotificationList />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.tabPT,
    gap: theme.spacing.sm,
  },
});
