import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { theme } from "@/theme/theme";
import Text from "@/components/ui/Text";
import Button from "@/components/ui/Button";
import { useAuthCtx } from "@/context/Auth";
import { pb } from "@/lib/pocketbase";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Home() {
  const { logout } = useAuthCtx();

  return (
    <ScrollView style={styles.container}>
      <SafeAreaView>
        <Text>Hola mundo</Text>
        <Button
          title="Sign out"
          onPress={() => {
            pb.authStore.clear();
            logout();
          }}
        />
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
