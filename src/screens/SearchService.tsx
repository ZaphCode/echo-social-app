import { useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { StaticScreenProps } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { searchServices, servicesKeys } from "@/api/services";
import SearchBar from "@/components/forms/SearchBar";
import ServiceCard from "@/components/ServiceCard";
import EmptyState from "@/components/ui/EmptyState";
import Loader from "@/components/ui/Loader";
import Text from "@/components/ui/Text";
import { useAuthCtx } from "@/context/Auth";
import useTheme from "@/hooks/useTheme";
import { space } from "@/theme/theme";

type Props = StaticScreenProps<{ search: string }>;

export default function SearchService({ route }: Props) {
  const { user } = useAuthCtx();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState(route.params.search);

  const servicesQuery = useQuery({
    queryKey: servicesKeys.search(search),
    queryFn: () => searchServices(search),
    enabled: !!search.trim(),
  });
  const results = servicesQuery.data ?? [];

  return (
    <View style={[styles.fill, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <SearchBar initialValue={search} onSearch={setSearch} />
        {servicesQuery.isSuccess && (
          <Text variant="label" tone="subtle">
            {`${results.length} ${results.length === 1 ? "resultado" : "resultados"} para “${search}”`}
          </Text>
        )}
      </View>
      {servicesQuery.isPending ? (
        <Loader label="Buscando…" />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ServiceCard authUser={user} service={item} />}
          ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + space.xl }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            servicesQuery.isError ? (
              <EmptyState
                tone="error"
                icon="alert-circle"
                title="No pudimos buscar"
                message="Revisa tu conexión e intenta de nuevo."
                action={{ label: "Reintentar", onPress: () => servicesQuery.refetch() }}
              />
            ) : (
              <EmptyState
                icon="search"
                title="Sin resultados"
                message={`No encontramos servicios para “${search}”. Prueba con otra palabra.`}
              />
            )
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  header: {
    paddingHorizontal: space.gutter,
    paddingTop: space.xs,
    paddingBottom: space.md,
    gap: 10,
  },
  list: {
    flexGrow: 1,
    paddingHorizontal: space.gutter,
  },
});
