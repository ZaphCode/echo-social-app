import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { ChatMessage } from "@/chat/types";
import Text from "./ui/Text";
import { theme } from "@/theme/theme";
import useColorScheme from "@/hooks/useColorScheme";

type StatusDescriptor =
  | {
      kind: "loading";
      color: string;
    }
  | {
      kind: "icon";
      icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
      color: string;
    };

type Props = {
  message: ChatMessage;
  currentUserId: string;
  isOnline: boolean;
  onRetry: (clientId: string) => Promise<void>;
};

export default function MessageField({
  message,
  currentUserId,
  isOnline,
  onRetry,
}: Props) {
  const { colors } = useColorScheme();
  const isSender = message.sender_id === currentUserId;
  const canRetry = isSender && message.sync_status === "failed";

  const styles = StyleSheet.create({
    container: {
      maxWidth: "75%",
      marginVertical: theme.spacing.xs,
      padding: theme.spacing.sm,
      borderRadius: 12,
    },
    sender: {
      backgroundColor: colors.secondaryBlue,
      alignSelf: "flex-end",
      borderTopRightRadius: 0,
    },
    receiver: {
      backgroundColor: colors.darkGray,
      alignSelf: "flex-start",
      borderTopLeftRadius: 0,
    },
    text: {
      fontFamily: theme.fontFamily.regular,
      fontSize: theme.fontSizes.md,
    },
    textSender: {
      color: "white",
    },
    textReceiver: {
      color: colors.lightGray,
    },
    statusContainer: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: isSender ? "flex-end" : "flex-start",
      marginTop: 6,
      gap: 4,
    },
    metaText: {
      fontSize: 11,
      color: isSender ? "rgba(255,255,255,0.72)" : colors.lightGray,
    },
  });

  const status = getMessageStatus({
    syncStatus: message.sync_status,
    isOnline,
    colors,
  });
  const sentTime = formatMessageTime(message.created_at_client);

  return (
    <Pressable
      style={[styles.container, isSender ? styles.sender : styles.receiver]}
      disabled={!canRetry}
      onPress={() => onRetry(message.client_id)}
    >
      <Text
        style={[
          styles.text,
          isSender ? styles.textSender : styles.textReceiver,
        ]}
      >
        {message.content}
      </Text>
      <View style={styles.statusContainer}>
        <Text style={styles.metaText}>{sentTime}</Text>
        {isSender && status ? (
          status.kind === "loading" ? (
            <ActivityIndicator size="small" color={status.color} />
          ) : (
            <MaterialCommunityIcons
              name={status.icon}
              size={12}
              color={status.color}
            />
          )
        ) : null}
      </View>
    </Pressable>
  );
}

function getMessageStatus({
  syncStatus,
  isOnline,
  colors,
}: {
  syncStatus: ChatMessage["sync_status"];
  isOnline: boolean;
  colors: ReturnType<typeof useColorScheme>["colors"];
}): StatusDescriptor {
  if (syncStatus === "sending") {
    return {
      kind: "loading" as const,
      color: colors.primaryBlue,
    };
  }

  if (syncStatus === "failed") {
    return {
      kind: "icon" as const,
      icon: "alert-circle-outline" as const,
      color: colors.redError,
    };
  }

  if (syncStatus === "pending") {
    return {
      kind: "icon" as const,
      icon: isOnline ? "clock-time-three-outline" : "cloud-off-outline",
      color: colors.lightGray,
    };
  }

  return {
    kind: "icon" as const,
    icon: "check-all" as const,
    color: colors.successGreen,
  };
}

function formatMessageTime(dateString: string) {
  return new Date(dateString).toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
