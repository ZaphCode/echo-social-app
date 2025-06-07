import { View, StyleSheet, FlatList } from "react-native";
import { StaticScreenProps } from "@react-navigation/native";

import { pb } from "@/lib/pocketbase";
import { theme } from "@/theme/theme";
import { useAuthCtx } from "@/context/Auth";
import { useState } from "react";
import Text from "@/components/ui/Text";
import useList from "@/hooks/useList";
import ServiceCard from "@/components/ServiceCard";
import SearchBar from "@/components/forms/SearchBar";
import Divider from "@/components/ui/Divider";
import Loader from "@/components/ui/Loader";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type Props = StaticScreenProps<{ search: string }>;

export default function SearchService({ route }: Props) {
  const { user } = useAuthCtx();
  const initialSearch = route.params.search;
  const [search, setSearch] = useState(initialSearch);

  const getFilter = (search: string) =>
    pb.filter(
      "name ~ {:search} || description ~ {:search} || category.name ~ {:search}",
      { search }
    );

  const [services, { status }, refetch] = useList("service", {
    filter: getFilter(search),
    expand: "provider, category",
  });

  async function handleSearch(newSearch: string) {
    setSearch(newSearch);
    await refetch({
      filter: getFilter(newSearch),
      expand: "provider, category",
    });
  }

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text fontFamily="bold" size={theme.fontSizes.xl} color="white">
          Resultados de
        </Text>
        <Text
          size={theme.fontSizes.xl}
          style={{ flexShrink: 1 }}
          numberOfLines={1}
          fontFamily="bold"
          color={theme.colors.primaryBlue}
        >{`"${search}"`}</Text>
      </View>
      <SearchBar onSearch={handleSearch} />
      <Divider />
      {status === "loading" ? (
        <Loader />
      ) : status === "error" ? (
        <ErrorSearchResults />
      ) : (
        <FlatList
          data={services}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ServiceCard authUser={user} service={item} />
          )}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<EmptySearchResults query={search} />}
        />
      )}
    </View>
  );
}

export function ErrorSearchResults() {
  return (
    <View style={styles.errorContainer}>
      <MaterialCommunityIcons
        name="alert-circle-outline"
        size={50}
        color={theme.colors.redError}
        style={{ marginBottom: 12 }}
      />
      <Text
        fontFamily="bold"
        size={theme.fontSizes.lg + 2}
        color={theme.colors.redError}
        style={{ marginBottom: 6, textAlign: "center" }}
      >
        Error al buscar servicios
      </Text>
      <Text
        color={theme.colors.lightGray}
        size={theme.fontSizes.md}
        style={{ textAlign: "center" }}
      >
        Ocurrió un problema al realizar la búsqueda. Revisa tu conexión e
        intenta de nuevo.
      </Text>
    </View>
  );
}

export function EmptySearchResults({ query }: { query: string }) {
  return (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons
        name="magnify-close"
        size={56}
        color={theme.colors.primaryBlue}
        style={{ marginBottom: 12 }}
      />
      <Text
        fontFamily="bold"
        size={theme.fontSizes.lg + 2}
        color="white"
        style={{ marginBottom: 6, textAlign: "center" }}
      >
        No se encontraron servicios
      </Text>
      <Text
        color={theme.colors.lightGray}
        size={theme.fontSizes.md}
        style={{ textAlign: "center" }}
      >
        {`No se encontraron servicios relacionados con "${query}". Intenta con otra búsqueda.`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  contentContainer: {
    justifyContent: "center",
    alignItems: "center",
    gap: theme.spacing.lg,
  },
  errorContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 54,
    paddingHorizontal: 30,
    opacity: 0.92,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 54,
    paddingHorizontal: 30,
    opacity: 0.92,
  },
});
