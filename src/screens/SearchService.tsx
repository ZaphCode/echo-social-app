import { View, StyleSheet, FlatList } from "react-native";
import { StaticScreenProps } from "@react-navigation/native";

import { theme } from "@/theme/theme";
import { useAuthCtx } from "@/context/Auth";
import Text from "@/components/ui/Text";
import useList from "@/hooks/useList";
import ServiceCard from "@/components/ServiceCard";
import { pb } from "@/lib/pocketbase";

type Props = StaticScreenProps<{ search: string }>;

export default function SearchService({ route }: Props) {
  const { user } = useAuthCtx();
  const { search } = route.params;

  const filter = pb.filter(
    "name ~ {:search} || description ~ {:search} || category.name ~ {:search}",
    { search }
  );

  const [services, { status }, refetch] = useList("service", {
    expand: "provider, category",
    filter,
  });

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text fontFamily="bold" size={theme.fontSizes.xl} color="white">
          Resultados de
        </Text>
        <Text
          size={theme.fontSizes.xl}
          color={theme.colors.primaryBlue}
        >{`"${search}"`}</Text>
      </View>
      <FlatList
        data={services}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ServiceCard authUser={user} service={item} />
        )}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      />
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
