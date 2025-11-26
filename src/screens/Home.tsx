import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { theme } from "@/theme/theme";

import { useAuthCtx } from "@/context/Auth";
import Text from "@/components/ui/Text";
import CategoryList from "@/components/CategoryList";
import ServiceList from "@/components/ServiceList";
import SearchBar from "@/components/forms/SearchBar";
import Divider from "@/components/ui/Divider";
import useColorScheme from "@/hooks/useColorScheme";

export default function Home() {
  const { user } = useAuthCtx();
  const { colors } = useColorScheme();
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");

  return (
    <ScrollView
      style={{ ...styles.container, backgroundColor: colors.background }}
    >
      <SafeAreaView style={{ gap: theme.spacing.md - 2 }}>
        <Text
          numberOfLines={1}
          fontFamily="bold"
          color={colors.text}
          size={theme.fontSizes.xxl}
        >
          {"Bienvenido " + getFirstName(user.name) + "!"}
        </Text>
        <SearchBar />
        <Text color={colors.text} fontFamily="bold" size={theme.fontSizes.lg}>
          Categorías
        </Text>
        <CategoryList
          selectedCategoryId={selectedCategoryId}
          setSelectedCategoryId={setSelectedCategoryId}
        />
        <Divider />
        <ServiceList
          key={selectedCategoryId}
          authUser={user}
          category={selectedCategoryId}
        />
      </SafeAreaView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    padding: theme.spacing.md,
    paddingTop: theme.spacing.tabPT,
  },
});

function getFirstName(name: string) {
  return name.split(" ")[0];
}
