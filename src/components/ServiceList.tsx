import { FlatList, StyleSheet, View } from "react-native";
import { useEffect } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { User } from "@/models/User";
import { theme } from "@/theme/theme";
import useList from "@/hooks/useList";
import ServiceCard from "./ServiceCard";
import Text from "./ui/Text";
import Loader from "./ui/Loader";

type Props = {
  authUser: User;
  category: string;
};

export default function ServiceList({ authUser, category }: Props) {
  const [services, { status }, refetch] = useList("service", {
    expand: "provider",
    filter: getFilter(category),
  });

  useEffect(() => {
    if (status !== "loading")
      refetch({
        expand: "provider",
        filter: getFilter(category),
      });
  }, [category]);

  if (status === "loading") {
    return (
      <View style={{ padding: theme.spacing.lg + 20 }}>
        <Loader />
      </View>
    );
  }

  if (status === "error") return <ErrorServicesComponent />;

  if (services.length === 0) return <EmptyServicesComponent />;

  return (
    <FlatList
      data={services}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <ServiceCard authUser={authUser} service={item} />
      )}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 0, gap: 18 }}
      showsHorizontalScrollIndicator={false}
      horizontal
    />
  );
}

export function EmptyServicesComponent() {
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
        color="white"
        style={{ marginBottom: 4 }}
      >
        No se encontraron servicios
      </Text>
      <Text
        color={theme.colors.lightGray}
        size={theme.fontSizes.md}
        style={{ textAlign: "center" }}
      >
        No hay servicios para esta categoría. Prueba otra o vuelve más tarde.
      </Text>
    </View>
  );
}

export function ErrorServicesComponent() {
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
        color={"white"}
        style={{ marginBottom: 4 }}
      >
        Error al cargar servicios
      </Text>
      <Text
        color={theme.colors.lightGray}
        size={theme.fontSizes.md}
        style={{ textAlign: "center" }}
      >
        Ocurrió un problema al cargar los servicios. Verifica tu conexión o
        intenta de nuevo.
      </Text>
    </View>
  );
}

function getFilter(category: string) {
  return category === "all" ? "" : `category = '${category}'`;
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
