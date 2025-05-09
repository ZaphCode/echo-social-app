import { StyleSheet, ScrollView } from "react-native";
import React from "react";
import { theme } from "@/theme/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import useLogout from "@/hooks/auth/useLogout";
import Button from "@/components/ui/Button";
import Text from "@/components/ui/Text";

export default function Profile() {
  const logout = useLogout();

  return (
    <ScrollView style={styles.container}>
      <SafeAreaView style={{ gap: 20 }}>
        <Text color="white" fontFamily="bold">
          Profile
        </Text>
        <Button title="Sign out" onPress={logout} />
      </SafeAreaView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    flexDirection: "column",
    padding: 20,
  },
});
