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
  return (
    <Pressable
      style={[styles.button, disabled && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={theme.colors.primaryBlue} />
      ) : (
        <Text style={[styles.text, { color: labelColor }]}>{title}</Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: theme.colors.secondaryBlue,
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
