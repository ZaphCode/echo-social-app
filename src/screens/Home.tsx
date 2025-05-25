import { ScrollView, StyleSheet, View } from "react-native";
import { theme } from "@/theme/theme";
import Text from "@/components/ui/Text";

import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthCtx } from "@/context/Auth";
import SearchBar from "@/components/SearchBar";
import CategoryList from "@/components/CategoryList";
import ServiceList from "@/components/ServiceList";

export default function Home() {
  const { user } = useAuthCtx();

  return (
    <ScrollView style={styles.container}>
      <SafeAreaView style={{ gap: theme.spacing.md - 2 }}>
        <Text
          numberOfLines={1}
          fontFamily="bold"
          color="white"
          size={theme.fontSizes.xxl}
        >
          {"Bienvenido " + getFirstName(user.name) + "!"}
        </Text>
        <SearchBar />
        <Text color="white" fontFamily="bold" size={theme.fontSizes.lg}>
          Categorías
        </Text>
        <CategoryList />
        <ServiceList authUser={user} />
      </SafeAreaView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    flexDirection: "column",
    padding: theme.spacing.md,
  },
});

function getFirstName(name: string) {
  return name.split(" ")[0];
}
