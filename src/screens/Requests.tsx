import { StyleSheet, ScrollView } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "@/theme/theme";
import Text from "@/components/ui/Text";

export default function Requests() {
  return (
    <ScrollView style={styles.container}>
      <SafeAreaView>
        <Text>Requests</Text>
      </SafeAreaView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.sm,
  },
});
