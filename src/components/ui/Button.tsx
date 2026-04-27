import React from "react";
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
} from "react-native";
import { theme } from "@/theme/theme";
import useAppTheme from "@/hooks/useAppTheme";

interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  labelColor?: string;
  style?: StyleProp<ViewStyle>;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  disabled,
  loading,
  style,
  labelColor = theme.colors.primaryBlue,
}) => {
  const { theme: appTheme } = useAppTheme();

  return (
    <Pressable
      style={[
        styles.button,
        { backgroundColor: appTheme.colors.brandSurface },
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={appTheme.colors.primary} />
      ) : (
        <Text style={[styles.text, { color: labelColor }]}>{title}</Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: theme.spacing.sm,
    height: 54,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontFamily: theme.fontFamily.bold,
    fontSize: theme.fontSizes.md,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default Button;
