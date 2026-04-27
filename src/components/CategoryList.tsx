import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import Text from "./ui/Text";
import { categoriesKeys, listServiceCategories } from "@/api/categories";
import Loader from "./ui/Loader";
import useColorScheme from "@/hooks/useColorScheme";

type Props = {
  selectedCategoryId: string;
  setSelectedCategoryId: (id: string) => void;
};

export default function CategoryList({
  selectedCategoryId,
  setSelectedCategoryId,
}: Props) {
  const { colors } = useColorScheme();
  const categoriesQuery = useQuery({
    queryKey: categoriesKeys.all,
    queryFn: listServiceCategories,
    refetchOnWindowFocus: false,
  });

  if (categoriesQuery.isPending) {
    return <Loader horizontal size={16} />;
  }

  if (categoriesQuery.isError) return <CategoryListError />;

  return (
    <FlatList
      data={[{ id: "all", name: "Todas" }, ...(categoriesQuery.data ?? [])]}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={(category) => category.id}
      renderItem={({ item: { id, name } }) => (
        <Pressable
          style={[
            styles.listItem,
            { backgroundColor: colors.darkerGray },
            id === selectedCategoryId && {
              backgroundColor: colors.secondaryBlue,
            },
          ]}
          onPress={() => setSelectedCategoryId(id)}
        >
          <Text
            color={id === selectedCategoryId ? colors.primaryBlue : colors.text}
          >
            {name}
          </Text>
        </Pressable>
      )}
    />
  );
}

function CategoryListError() {
  const { colors } = useColorScheme();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      <MaterialCommunityIcons
        name="alert-circle-outline"
        size={22}
        color={colors.redError}
      />
      <Text color={colors.redError}>Error cargando las categorías...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  listItem: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 16,
    borderRadius: 8,
  },
});
