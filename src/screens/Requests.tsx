import { StyleSheet } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "@/theme/theme";
import Text from "@/components/ui/Text";
import RequestsList from "@/components/RequestsList";
import Divider from "@/components/ui/Divider";

export default function Requests() {
  return (
    <SafeAreaView style={styles.container}>
      <Text fontFamily="bold" color="white" size={theme.fontSizes.xxl}>
        Solicitudes
      </Text>
      <Divider />
      <RequestsList />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    paddingTop: theme.spacing.tabPT,
    height: "100%",
    gap: theme.spacing.sm,
  },
});
