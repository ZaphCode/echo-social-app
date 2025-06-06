import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { theme } from "@/theme/theme";
import Text from "./ui/Text";
import useList from "@/hooks/useList";
import Loader from "./ui/Loader";

type Props = {
  selectedCategoryId: string;
  setSelectedCategoryId: (id: string) => void;
};

export default function CategoryList({
  selectedCategoryId,
  setSelectedCategoryId,
}: Props) {
  const [categories, { status, error }] = useList("service_category", {
    notRefreshOnFocus: true,
  });

  if (status === "loading") {
    return <Loader horizontal size={16} />;
  }

  if (status === "error") return <CategoryListError />;

  return (
    <FlatList
      data={[{ id: "all", name: "Todas" }, ...categories]}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={(category) => category.id}
      renderItem={({ item: { id, name } }) => (
        <Pressable
          style={[
            styles.listItem,
            id === selectedCategoryId && styles.selectedListItem,
          ]}
          onPress={() => setSelectedCategoryId(id)}
        >
          <Text
            color={
              id === selectedCategoryId ? theme.colors.primaryBlue : "white"
            }
          >
            {name}
          </Text>
        </Pressable>
      )}
    />
  );
}

function CategoryListError() {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      <MaterialCommunityIcons
        name="alert-circle-outline"
        size={22}
        color={theme.colors.redError}
      />
      <Text color={theme.colors.redError}>
        Error cargando las categorías...
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  listItem: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.darkerGray,
    marginRight: 16,
    borderRadius: 8,
  },
  selectedListItem: {
    backgroundColor: theme.colors.secondaryBlue,
  },
});
