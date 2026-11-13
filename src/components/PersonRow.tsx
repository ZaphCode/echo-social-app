import { Pressable, StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import useTheme from "@/hooks/useTheme";
import { radius } from "@/theme/theme";
import Avatar from "./ui/Avatar";
import Text from "./ui/Text";

type Props = {
  name?: string;
  avatar?: string | null;
  caption: string;
  onPress?: () => void;
};

/** Tappable "who publishes this" row on detail screens. */
export default function PersonRow({ name, avatar, caption, onPress }: Props) {
  const { colors } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ver perfil de ${name ?? "usuario"}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: colors.surface, borderColor: colors.line, opacity: pressed ? 0.85 : 1 },
      ]}
    >
      <Avatar name={name} path={avatar} size={46} />
      <View style={styles.text}>
        <Text bold numberOfLines={1}>
          {name || "Usuario"}
        </Text>
        <Text variant="caption" tone="subtle" numberOfLines={1}>
          {caption}
        </Text>
      </View>
      <Feather name="chevron-right" size={20} color={colors.textSubtle} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: radius.card,
    borderWidth: 1,
  },
  text: {
    flex: 1,
    minWidth: 0,
  },
});
