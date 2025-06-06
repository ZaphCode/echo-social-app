import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native";

import { theme } from "@/theme/theme";
import Text from "@/components/ui/Text";
import NotificationList from "@/components/NotificationList";
import Divider from "@/components/ui/Divider";

export default function Notifications() {
  return (
    <SafeAreaView style={styles.container}>
      <Text fontFamily="bold" color="white" size={theme.fontSizes.xxl}>
        Notificaciones
      </Text>
      <Divider />
      <NotificationList />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    height: "100%",
    paddingTop: theme.spacing.tabPT,
    gap: theme.spacing.sm,
  },
});
