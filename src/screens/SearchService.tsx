import { View, StyleSheet, FlatList } from "react-native";
import { StaticScreenProps } from "@react-navigation/native";

import { theme } from "@/theme/theme";
import { useAuthCtx } from "@/context/Auth";
import Text from "@/components/ui/Text";
import useList from "@/hooks/useList";
import ServiceCard from "@/components/ServiceCard";
import { pb } from "@/lib/pocketbase";
import SearchBar from "@/components/forms/SearchBar";
import Divider from "@/components/ui/Divider";
import { useMemo, useState } from "react";
import Loader from "@/components/ui/Loader";

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
      ) : (
        <FlatList
          data={services}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ServiceCard authUser={user} service={item} />
          )}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
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
});
