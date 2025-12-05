import { StyleSheet } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "@/theme/theme";
import Text from "@/components/ui/Text";
import RequestsList from "@/components/RequestsList";
import Divider from "@/components/ui/Divider";
import useColorScheme from "@/hooks/useColorScheme";
import Title from "@/components/ui/Title";

export default function Requests() {
  const { colors } = useColorScheme();
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Title title="Solicitudes" />
      <Divider />
      <RequestsList />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
    paddingTop: theme.spacing.tabPT,
    height: "100%",
    gap: theme.spacing.sm,
  },
});
