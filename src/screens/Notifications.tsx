import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native";

import { theme } from "@/theme/theme";
import Text from "@/components/ui/Text";
import NotificationList from "@/components/NotificationList";
import Divider from "@/components/ui/Divider";
import { useAlertCtx } from "@/context/Alert";
import useColorScheme from "@/hooks/useColorScheme";

export default function Notifications() {
  const { colors } = useColorScheme();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Text fontFamily="bold" color={colors.text} size={theme.fontSizes.xxl}>
        Notificaciones
      </Text>
      <Divider />
      <NotificationList />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
    height: "100%",
    paddingTop: theme.spacing.tabPT,
    gap: theme.spacing.sm,
  },
});
