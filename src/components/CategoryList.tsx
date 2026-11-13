import { memo } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";

import useCategories from "@/hooks/useCategories";
import useTheme from "@/hooks/useTheme";
import { getCategoryImage } from "@/theme/categoryImages";
import { radius, space } from "@/theme/theme";
import Text from "./ui/Text";

type Props = {
  selectedCategoryId: string;
  setSelectedCategoryId: (id: string) => void;
  /** "photo" = story tiles on Inicio; "chip" = compact pills over the map. */
  look?: "photo" | "chip";
};

const ALL = { id: "all", name: "Todas" };

function CategoryList({ selectedCategoryId, setSelectedCategoryId, look = "photo" }: Props) {
  const { colors } = useTheme();
  const { categories, isError } = useCategories();

  if (isError) {
    return (
      <View style={styles.error}>
        <Feather name="alert-circle" size={16} color={colors.danger} />
        <Text variant="label" tone="danger">
          No se pudieron cargar las categorías
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={[ALL, ...categories]}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={(category) => category.id}
      contentContainerStyle={styles.content}
      renderItem={({ item }) => {
        const selected = item.id === selectedCategoryId;
        const select = () => setSelectedCategoryId(item.id);
        return look === "chip" ? (
          <CategoryChip name={item.name} selected={selected} onPress={select} />
        ) : (
          <CategoryTile
            name={item.name}
            isAll={item.id === ALL.id}
            selected={selected}
            onPress={select}
          />
        );
      }}
    />
  );
}

function CategoryTile({
  name,
  isAll,
  selected,
  onPress,
}: {
  name: string;
  isAll: boolean;
  selected: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const image = isAll ? undefined : getCategoryImage(name);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={name}
      onPress={onPress}
      style={({ pressed }) => [
        styles.tile,
        { backgroundColor: isAll && selected ? colors.accent : colors.surface2 },
        selected && !isAll && { borderColor: colors.accent, borderWidth: 2 },
        selected && { boxShadow: `0 12px 26px -12px ${colors.accentGlow}` },
        { opacity: pressed ? 0.85 : 1 },
      ]}
    >
      {image ? (
        <>
          <Image source={image} style={StyleSheet.absoluteFill} contentFit="cover" transition={160} />
          <View
            style={[
              StyleSheet.absoluteFill,
              {
                experimental_backgroundImage:
                  "linear-gradient(180deg, rgba(8,9,11,0) 30%, rgba(8,9,11,0.88) 100%)",
              },
            ]}
          />
        </>
      ) : (
        <View
          style={[
            styles.tileIcon,
            { backgroundColor: isAll && selected ? "rgba(255,255,255,0.18)" : colors.surface3 },
          ]}
        >
          {isAll ? (
            <Feather name="grid" size={18} color={selected ? colors.onAccent : colors.text} />
          ) : (
            <Text bold>{name.charAt(0)}</Text>
          )}
        </View>
      )}
      <Text
        variant="caption"
        bold
        align="center"
        numberOfLines={2}
        color={image || (isAll && selected) ? "#FFFFFF" : colors.text}
        style={styles.tileLabel}
      >
        {name}
      </Text>
    </Pressable>
  );
}

function CategoryChip({
  name,
  selected,
  onPress,
}: {
  name: string;
  selected: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? colors.accent : colors.glass,
          borderColor: selected ? colors.accent : colors.line,
        },
      ]}
    >
      <Text variant="label" bold color={selected ? colors.onAccent : colors.text}>
        {name}
      </Text>
    </Pressable>
  );
}

export default memo(CategoryList);

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: space.gutter,
    gap: 10,
  },
  tile: {
    width: 92,
    height: 120,
    borderRadius: radius.card,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 12,
    paddingHorizontal: 6,
    gap: 10,
  },
  tileIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  tileLabel: {
    lineHeight: 15,
  },
  chip: {
    height: 38,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    borderWidth: 1,
    justifyContent: "center",
  },
  error: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: space.gutter,
  },
});
