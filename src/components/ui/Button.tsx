import { ComponentProps } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { Feather } from "@expo/vector-icons";

import useTheme from "@/hooks/useTheme";
import { fonts, radius } from "@/theme/theme";
import Text from "./Text";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

type Props = {
  title: string;
  onPress?: () => void | Promise<void>;
  variant?: ButtonVariant;
  size?: "lg" | "md" | "sm";
  icon?: ComponentProps<typeof Feather>["name"];
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

const heights = { lg: 56, md: 48, sm: 38 };
const paddings = { lg: 24, md: 12, sm: 16 };

export default function Button({
  title,
  onPress,
  variant = "primary",
  size = "lg",
  icon,
  disabled,
  loading,
  style,
}: Props) {
  const { colors } = useTheme();

  const look = {
    primary: { bg: colors.accent, fg: colors.onAccent },
    secondary: { bg: colors.surface2, fg: colors.text },
    ghost: { bg: "transparent", fg: colors.accentText },
    danger: { bg: colors.dangerSoft, fg: colors.danger },
  }[variant];

  const isInactive = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!isInactive, busy: !!loading }}
      onPress={onPress}
      disabled={isInactive}
      style={({ pressed }) => [
        styles.base,
        {
          height: heights[size],
          paddingHorizontal: paddings[size],
          backgroundColor: look.bg,
          opacity: disabled ? 0.4 : pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        variant === "primary" &&
          !disabled && { boxShadow: `0 8px 24px -6px ${colors.accentGlow}` },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={look.fg} />
      ) : (
        <>
          {icon && <Feather name={icon} size={size === "sm" ? 16 : 18} color={look.fg} />}
          <Text
            color={look.fg}
            style={[styles.label, { fontSize: size === "lg" ? 16 : size === "md" ? 15 : 14 }]}
            numberOfLines={1}
          >
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.pill,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  label: {
    fontFamily: fonts.bold,
  },
});
