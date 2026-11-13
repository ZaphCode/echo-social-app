import { ComponentProps } from "react";
import { StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import useTheme from "@/hooks/useTheme";
import { space } from "@/theme/theme";
import Button from "./Button";
import Text from "./Text";

type Props = {
  icon: ComponentProps<typeof Feather>["name"];
  title: string;
  message?: string;
  tone?: "neutral" | "error";
  action?: { label: string; onPress: () => void };
  compact?: boolean;
};

/** Shared empty / error / offline state. */
export default function EmptyState({
  icon,
  title,
  message,
  tone = "neutral",
  action,
  compact,
}: Props) {
  const { colors } = useTheme();
  const isError = tone === "error";

  return (
    <View style={[styles.container, compact && styles.compact]}>
      <View
        style={[
          styles.iconWrap,
          { backgroundColor: isError ? colors.dangerSoft : colors.surface },
        ]}
      >
        <Feather
          name={icon}
          size={26}
          color={isError ? colors.danger : colors.accentText}
        />
      </View>
      <Text variant="heading" align="center">
        {title}
      </Text>
      {message ? (
        <Text tone="muted" align="center" style={styles.message}>
          {message}
        </Text>
      ) : null}
      {action ? (
        <Button
          title={action.label}
          variant="secondary"
          size="md"
          onPress={action.onPress}
          style={styles.action}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    paddingHorizontal: space.lg,
    gap: space.xs,
  },
  compact: {
    paddingVertical: space.lg,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: space.xs,
  },
  message: {
    maxWidth: 300,
  },
  action: {
    marginTop: space.sm,
  },
});
