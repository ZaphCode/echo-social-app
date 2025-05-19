import React from "react";
import { StyleSheet } from "react-native";
import { theme } from "@/theme/theme";
import Text from "@/components/ui/Text";
import { SafeAreaView } from "react-native-safe-area-context";
import NotificationList from "@/components/NotificationList";

export default function Notifications() {
  return (
    <SafeAreaView style={styles.container}>
      <Text fontFamily="bold" color="white" size={theme.fontSizes.xxl}>
        Notificaciones
      </Text>
      <NotificationList />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    height: "100%",
  },
});
