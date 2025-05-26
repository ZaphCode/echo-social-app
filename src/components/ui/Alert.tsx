import React, { useEffect } from "react";
import { View, StyleSheet, Animated, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { theme } from "@/theme/theme";
import Text from "./Text";

type Props = {
  visible: boolean;
  message: string;
  type?: "success" | "info" | "error";
  onClose?: () => void;
  duration?: number;
};

type AlertStyles = {
  backgroundColor: string;
  borderColor: string;
  icon: keyof typeof Feather.glyphMap;
  iconColor: string;
};

export default function Alert({ visible, message, type = "info", onClose, duration = 2000 }: Props) {
  const translateY = new Animated.Value(-100);
  const opacity = new Animated.Value(0);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        hideAlert();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideAlert = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose?.();
    });
  };

  if (!visible) return null;

  const getAlertStyles = (): AlertStyles => {
    switch (type) {
      case "success":
        return {
          backgroundColor: `${theme.colors.primaryBlue}20`,
          borderColor: theme.colors.primaryBlue,
          icon: "check-circle",
          iconColor: theme.colors.primaryBlue,
        };
      case "error":
        return {
          backgroundColor: `${theme.colors.redError}20`,
          borderColor: theme.colors.redError,
          icon: "alert-circle",
          iconColor: theme.colors.redError,
        };
      default:
        return {
          backgroundColor: `${theme.colors.secondaryBlue}20`,
          borderColor: theme.colors.secondaryBlue,
          icon: "info",
          iconColor: theme.colors.secondaryBlue,
        };
    }
  };

  const styles = getAlertStyles();

  return (
    <Animated.View
      style={[
        alertStyles.container,
        {
          transform: [{ translateY }],
          opacity,
          backgroundColor: styles.backgroundColor,
          borderColor: styles.borderColor,
        },
      ]}
    >
      <View style={alertStyles.content}>
        <Feather name={styles.icon} size={24} color={styles.iconColor} />
        <Text
          style={[
            alertStyles.message,
            { color: styles.iconColor },
          ]}
        >
          {message}
        </Text>
      </View>
      <Pressable onPress={hideAlert} style={alertStyles.closeButton}>
        <Feather name="x" size={20} color={styles.iconColor} />
      </Pressable>
    </Animated.View>
  );
}

const alertStyles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    margin: theme.spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    padding: theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 1000,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  content: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  message: {
    flex: 1,
    fontFamily: theme.fontFamily.bold,
    fontSize: theme.fontSizes.md,
  },
  closeButton: {
    padding: 5,
  },
}); 