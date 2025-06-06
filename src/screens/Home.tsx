import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { theme } from "@/theme/theme";
import { useNavigation } from "@react-navigation/native";

import { useAuthCtx } from "@/context/Auth";
import Text from "@/components/ui/Text";
import CategoryList from "@/components/CategoryList";
import ServiceList from "@/components/ServiceList";
import SearchBar from "@/components/forms/SearchBar";

export default function Home() {
  const { user } = useAuthCtx();
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");

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
        <CategoryList
          selectedCategoryId={selectedCategoryId}
          setSelectedCategoryId={setSelectedCategoryId}
        />
        <ServiceList authUser={user} category={selectedCategoryId} />
      </SafeAreaView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    flexDirection: "column",
    padding: theme.spacing.md,
    paddingTop: theme.spacing.tabPT,
  },
});

function getFirstName(name: string) {
  return name.split(" ")[0];
}
