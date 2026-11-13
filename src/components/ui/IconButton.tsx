import { ComponentProps } from "react";
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { Feather } from "@expo/vector-icons";

import useTheme from "@/hooks/useTheme";
import { fonts } from "@/theme/theme";
import Text from "./Text";

type Props = {
  icon: ComponentProps<typeof Feather>["name"];
  onPress?: () => void;
  accessibilityLabel: string;
  size?: number;
  /** "surface" sits on the page; "glass" floats over photos. */
  tone?: "surface" | "glass" | "accent";
  badge?: number;
  disabled?: boolean;
  iconColor?: string;
  style?: StyleProp<ViewStyle>;
};

export default function IconButton({
  icon,
  onPress,
  accessibilityLabel,
  size = 44,
  tone = "surface",
  badge,
  disabled,
  iconColor,
  style,
}: Props) {
  const { colors } = useTheme();
  const bg = {
    surface: colors.surface,
    glass: "rgba(14,15,17,0.55)",
    accent: colors.accent,
  }[tone];
  const fg =
    iconColor ?? (tone === "surface" ? colors.text : colors.onAccent);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      disabled={disabled}
      hitSlop={6}
      style={({ pressed }) => [
        styles.base,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bg,
          opacity: disabled ? 0.4 : pressed ? 0.75 : 1,
        },
        tone === "surface" && { borderWidth: 1, borderColor: colors.line },
        style,
      ]}
    >
      <Feather name={icon} size={Math.round(size * 0.43)} color={fg} />
      {!!badge && badge > 0 && (
        <View
          style={[
            styles.badge,
            { backgroundColor: colors.accent, borderColor: colors.bg },
          ]}
        >
          <Text style={styles.badgeText} color={colors.onAccent}>
            {badge > 99 ? "99+" : String(badge)}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: -3,
    right: -3,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    fontFamily: fonts.bold,
    fontSize: 10,
    lineHeight: 12,
  },
});
