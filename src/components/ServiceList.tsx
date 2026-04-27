import { FlatList, StyleSheet, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { listServicesByCategory, servicesKeys } from "@/api/services";
import { ServiceWithProvider } from "@/api/types";
import { User } from "@/models/User";
import { theme } from "@/theme/theme";
import ServiceCard from "./ServiceCard";
import Text from "./ui/Text";
import Loader from "./ui/Loader";
import useColorScheme from "@/hooks/useColorScheme";

type Props = {
  authUser: User;
  category: string;
};

export default function ServiceList({ authUser, category }: Props) {
  const servicesQuery = useQuery({
    queryKey: servicesKeys.byCategory(category),
    queryFn: () => listServicesByCategory(category),
  });

  if (servicesQuery.isPending) {
    return (
      <View style={{ padding: theme.spacing.lg + 20 }}>
        <Loader />
      </View>
    );
  }

  if (servicesQuery.isError) return <ErrorServicesComponent />;

  if ((servicesQuery.data?.length ?? 0) === 0) return <EmptyServicesComponent />;

  return (
    <FlatList
      data={servicesQuery.data}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <ServiceCard
          authUser={authUser}
          service={item as ServiceWithProvider}
        />
      )}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 0, gap: 18 }}
      showsHorizontalScrollIndicator={false}
      horizontal
    />
  );
}

export function EmptyServicesComponent() {
  const { colors } = useColorScheme();
  return (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons
        name="format-list-bulleted"
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
        No se encontraron servicios
      </Text>
      <Text
        color={colors.lightGray}
        size={theme.fontSizes.md}
        style={{ textAlign: "center" }}
      >
        No hay servicios para esta categoría. Prueba otra o vuelve más tarde.
      </Text>
    </View>
  );
}

export function ErrorServicesComponent() {
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
        Error al cargar servicios
      </Text>
      <Text
        color={colors.lightGray}
        size={theme.fontSizes.md}
        style={{ textAlign: "center" }}
      >
        Ocurrió un problema al cargar los servicios. Verifica tu conexión o
        intenta de nuevo.
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
