import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ChatMessage } from "@/chat/types";
import useTheme from "@/hooks/useTheme";
import { ThemeColors } from "@/theme/theme";
import Text from "./ui/Text";

type Props = {
  message: ChatMessage;
  currentUserId: string;
  isOnline: boolean;
  onRetry: (clientId: string) => Promise<void>;
};

type Status =
  | { kind: "sending"; label: string; color: string }
  | { kind: "icon"; icon: React.ComponentProps<typeof Feather>["name"]; label: string; color: string };

function getStatus(
  syncStatus: ChatMessage["sync_status"],
  isOnline: boolean,
  colors: ThemeColors,
): Status {
  if (syncStatus === "sending") return { kind: "sending", label: "Enviando", color: colors.textSubtle };
  if (syncStatus === "failed")
    return { kind: "icon", icon: "alert-circle", label: "No se envió · Toca para reintentar", color: colors.danger };
  if (syncStatus === "pending")
    return isOnline
      ? { kind: "icon", icon: "clock", label: "En cola", color: colors.textSubtle }
      : { kind: "icon", icon: "cloud-off", label: "En espera de conexión", color: colors.warn };
  return { kind: "icon", icon: "check", label: "", color: colors.success };
}

const timeFormatter = new Intl.DateTimeFormat("es-MX", { hour: "2-digit", minute: "2-digit" });

function MessageField({ message, currentUserId, isOnline, onRetry }: Props) {
  const { colors } = useTheme();
  const isMine = message.sender_id === currentUserId;
  const failed = isMine && message.sync_status === "failed";
  const status = getStatus(message.sync_status, isOnline, colors);
  const time = timeFormatter.format(new Date(message.created_at_client));
  const isWaiting = isMine && message.sync_status !== "sent" && !failed;

  return (
    <Pressable
      disabled={!failed}
      onPress={() => onRetry(message.client_id)}
      accessibilityRole={failed ? "button" : undefined}
      accessibilityHint={failed ? "Reintentar envío" : undefined}
      style={[styles.wrap, isMine ? styles.mine : styles.theirs]}
    >
      <View
        style={[
          styles.bubble,
          isMine
            ? [
                styles.bubbleMine,
                failed
                  ? { backgroundColor: colors.dangerSoft, borderColor: colors.danger, borderWidth: 1 }
                  : { backgroundColor: colors.accent, opacity: isWaiting ? 0.82 : 1 },
              ]
            : [styles.bubbleTheirs, { backgroundColor: colors.surface, borderColor: colors.line }],
        ]}
      >
        <Text color={isMine && !failed ? colors.onAccent : colors.text} style={styles.text}>
          {message.content}
        </Text>
      </View>
      <View style={styles.meta}>
        <Text variant="micro" tone="subtle">
          {time}
        </Text>
        {isMine &&
          (status.kind === "sending" ? (
            <ActivityIndicator size="small" color={status.color} style={styles.spinner} />
          ) : (
            <>
              {status.label ? (
                <Text variant="micro" bold={failed} color={status.color}>
                  {status.label}
                </Text>
              ) : null}
              <Feather name={status.icon} size={12} color={status.color} />
            </>
          ))}
      </View>
    </Pressable>
  );
}

export default React.memo(MessageField, (prev, next) => {
  return (
    prev.currentUserId === next.currentUserId &&
    prev.isOnline === next.isOnline &&
    prev.onRetry === next.onRetry &&
    prev.message.local_id === next.message.local_id &&
    prev.message.client_id === next.message.client_id &&
    prev.message.server_id === next.message.server_id &&
    prev.message.content === next.message.content &&
    prev.message.created_at_client === next.message.created_at_client &&
    prev.message.sync_status === next.message.sync_status
  );
});

const styles = StyleSheet.create({
  wrap: {
    maxWidth: "78%",
    marginVertical: 4,
    gap: 4,
  },
  mine: {
    alignSelf: "flex-end",
    alignItems: "flex-end",
  },
  theirs: {
    alignSelf: "flex-start",
    alignItems: "flex-start",
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },
  bubbleMine: {
    borderBottomRightRadius: 6,
  },
  bubbleTheirs: {
    borderBottomLeftRadius: 6,
    borderWidth: 1,
  },
  text: {
    fontSize: 15,
    lineHeight: 21,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 4,
  },
  spinner: {
    transform: [{ scale: 0.6 }],
    height: 12,
  },
});
