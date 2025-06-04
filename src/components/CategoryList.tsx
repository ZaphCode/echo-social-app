import { FlatList, Pressable, StyleSheet } from "react-native";

import { theme } from "@/theme/theme";
import Text from "./ui/Text";
import useList from "@/hooks/useList";

type Props = {
  selectedCategoryId: string;
  setSelectedCategoryId: (id: string) => void;
};

export default function CategoryList({
  selectedCategoryId,
  setSelectedCategoryId,
}: Props) {
  const [categories, fetchData] = useList("service_category", {
    cache: "force-cache",
  });

  if (fetchData.status === "loading") {
    return <Text>Loading...</Text>;
  }

  if (fetchData.status === "error") {
    return <Text color={theme.colors.redError}>{fetchData.error!}</Text>;
  }

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

const styles = StyleSheet.create({
  listItem: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.darkerGray,
    marginVertical: 8,
    marginRight: 16,
    borderRadius: 8,
  },
  selectedListItem: {
    backgroundColor: theme.colors.secondaryBlue,
  },
});
