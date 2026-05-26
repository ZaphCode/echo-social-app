import { FlatList, StyleSheet, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import {
  contractingsKeys,
  listContractingsByCategory,
} from "@/api/contractings";
import { ContractingWithOwner } from "@/api/types";
import { User } from "@/models/User";
import { theme } from "@/theme/theme";
import ContractingCard from "./ContractingCard";
import Loader from "./ui/Loader";
import Text from "./ui/Text";
import useColorScheme from "@/hooks/useColorScheme";

type Props = {
  authUser: User;
  category: string;
};

export default function ContractingList({ authUser, category }: Props) {
  const contractingsQuery = useQuery({
    queryKey: contractingsKeys.byCategory(category, authUser.id),
    queryFn: () => listContractingsByCategory(category, authUser.id),
  });

  if (contractingsQuery.isPending) {
    return (
      <View style={{ padding: theme.spacing.lg + 20 }}>
        <Loader />
      </View>
    );
  }

  if (contractingsQuery.isError) return <ErrorContractingsComponent />;

  if ((contractingsQuery.data?.length ?? 0) === 0) {
    return <EmptyContractingsComponent />;
  }

  return (
    <FlatList
      data={contractingsQuery.data}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <ContractingCard
          authUser={authUser}
          contracting={item as ContractingWithOwner}
        />
      )}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 0, gap: 18 }}
      showsHorizontalScrollIndicator={false}
      horizontal
    />
  );
}

function EmptyContractingsComponent() {
  const { colors } = useColorScheme();
  return (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons
        name="briefcase-search-outline"
        size={48}
        color={theme.colors.primaryBlue}
        style={{ marginBottom: 14 }}
      />
      <Text
        fontFamily="bold"
        size={theme.fontSizes.lg + 2}
        color={colors.text}
        style={{ marginBottom: 4 }}
      >
        No hay contrataciones
      </Text>
      <Text
        color={colors.lightGray}
        size={theme.fontSizes.md}
        style={{ textAlign: "center" }}
      >
        No hay contrataciones para esta categoría. Vuelve más tarde.
      </Text>
    </View>
  );
}

function ErrorContractingsComponent() {
  const { colors } = useColorScheme();
  return (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons
        name="alert-circle-outline"
        size={46}
        color={theme.colors.redError}
        style={{ marginBottom: 14 }}
      />
      <Text
        fontFamily="bold"
        size={theme.fontSizes.lg + 2}
        color={colors.text}
        style={{ marginBottom: 4 }}
      >
        Error al cargar contrataciones
      </Text>
      <Text
        color={colors.lightGray}
        size={theme.fontSizes.md}
        style={{ textAlign: "center" }}
      >
        Ocurrió un problema al cargar las contrataciones.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 38,
    paddingHorizontal: 24,
    opacity: 0.92,
  },
});
