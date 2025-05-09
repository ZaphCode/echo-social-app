import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { theme } from "@/theme/theme";
import Text from "@/components/ui/Text";

import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthCtx } from "@/context/Auth";

export default function Home() {
  const { user } = useAuthCtx();

  return (
    <ScrollView style={styles.container}>
      <SafeAreaView>
        <Text fontFamily="bold" color="white" size={theme.fontSizes.xxl}>
          {"Hola " + user.name}
        </Text>
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
