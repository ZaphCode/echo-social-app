import React from "react";
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
  TextStyle,
} from "react-native";
import { theme } from "@/theme/theme";

interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  textColor?: string;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  disabled,
  loading,
  style,
  textStyle,
  textColor,
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
        <Text style={[styles.text, textStyle, textColor && { color: textColor }]}>{title}</Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: theme.colors.secondaryBlue,
    paddingVertical: theme.spacing.sm,
    height: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: theme.colors.primaryBlue,
    fontFamily: theme.fontFamily.bold,
    fontSize: theme.fontSizes.md,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default Button;
