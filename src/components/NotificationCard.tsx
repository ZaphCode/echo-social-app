import { ComponentProps, memo } from "react";
import { StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { NotificationWithUser } from "@/api/types";
import useTheme from "@/hooks/useTheme";
import { Notification } from "@/models/Notification";
import { radius } from "@/theme/theme";
import { formatRelativeShort } from "@/utils/format";
import Text from "./ui/Text";

type Props = { notification: NotificationWithUser };

const KIND: Record<
  Notification["type"],
  { icon: ComponentProps<typeof Feather>["name"]; tone: "accent" | "success" | "warn" | "neutral" }
> = {
  "PROVIDER:NEW_REQUEST": { icon: "user-plus", tone: "accent" },
  "PROVIDER:NEW_APPLICATION": { icon: "briefcase", tone: "accent" },
  "CLIENT:NEW_OFFER": { icon: "tag", tone: "warn" },
  "PROVIDER:NEW_OFFER": { icon: "tag", tone: "success" },
  "SYSTEM:INFO": { icon: "bell", tone: "neutral" },
};

function NotificationCard({ notification }: Props) {
  const { colors } = useTheme();
  const kind = KIND[notification.type] ?? KIND["SYSTEM:INFO"];
  const palette = {
    accent: [colors.accentSoft, colors.accentText],
    success: [colors.successSoft, colors.success],
    warn: [colors.warnSoft, colors.warn],
    neutral: [colors.surface2, colors.textMuted],
  }[kind.tone];

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: notification.read ? "transparent" : colors.surface },
      ]}
    >
      <View style={[styles.icon, { backgroundColor: palette[0] }]}>
        <Feather name={kind.icon} size={18} color={palette[1]} />
      </View>
      <View style={styles.body}>
        <Text variant="label" tone={notification.read ? "muted" : "default"}>
          {parseBold(notification.message)}
        </Text>
        <Text variant="caption" tone="subtle">
          {formatRelativeShort(notification.created_at)}
        </Text>
      </View>
      {!notification.read && (
        <View
          accessibilityLabel="Sin leer"
          style={[styles.unread, { backgroundColor: colors.accent }]}
        />
      )}
    </View>
  );
}

export default memo(NotificationCard);

/** Messages mark names with *asterisks*; render those parts bold. */
export function parseBold(text: string) {
  return text.split(/(\*[^*]+\*)/g).map((part, index) =>
    part.startsWith("*") && part.endsWith("*") ? (
      <Text key={index} variant="label" bold>
        {part.slice(1, -1)}
      </Text>
    ) : (
      part
    ),
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 14,
    borderRadius: radius.card,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    flex: 1,
    gap: 4,
  },
  unread: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginTop: 6,
  },
});
