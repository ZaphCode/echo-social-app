import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

import { categoriesKeys } from "@/api/categories";
import { contractingsKeys } from "@/api/contractings";
import { servicesKeys } from "@/api/services";
import { theme } from "@/theme/theme";

import { useAuthCtx } from "@/context/Auth";
import Text from "@/components/ui/Text";
import CategoryList from "@/components/CategoryList";
import ServiceList from "@/components/ServiceList";
import ContractingList from "@/components/ContractingList";
import SearchBar from "@/components/forms/SearchBar";
import Divider from "@/components/ui/Divider";
import useColorScheme from "@/hooks/useColorScheme";
import Title from "@/components/ui/Title";

export default function Home() {
  const { user } = useAuthCtx();
  const { colors } = useColorScheme();
  const queryClient = useQueryClient();
  const tabBarHeight = useBottomTabBarHeight();
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");

  return (
    <ScrollView
      style={{ ...styles.container, backgroundColor: colors.background }}
      contentContainerStyle={{
        paddingBottom: tabBarHeight + theme.spacing.lg,
      }}
    >
      <SafeAreaView style={{ gap: theme.spacing.md }}>
        <Title
          title={`Hola, ${getFirstName(user.name)} 👋`}
          onRefresh={() => {
            queryClient.invalidateQueries({ queryKey: categoriesKeys.all });
            queryClient.invalidateQueries({ queryKey: servicesKeys.all });
            queryClient.invalidateQueries({ queryKey: contractingsKeys.all });
          }}
        />
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
        <Divider />
        <Text color={colors.text} fontFamily="bold" size={theme.fontSizes.lg}>
          Contrataciones
        </Text>
        <ContractingList
          key={`contractings-${selectedCategoryId}`}
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
