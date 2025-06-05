import { View, StyleSheet, Text as RNText } from "react-native";
import { theme } from "@/theme/theme";

import Text from "./ui/Text";
import { Notification } from "@/models/Notification";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { formatDateLong } from "@/utils/format";

interface Props {
  notification: Notification;
}

export default function NotificationCard({ notification }: Props) {
  const { icon, color } = getIconAndColor(notification.type, notification.read);

  return (
    <View style={[styles.card, notification.read && styles.cardRead]}>
      <MaterialCommunityIcons
        name={icon as any}
        size={28}
        color={color}
        style={{ marginRight: 10 }}
      />
      <View style={{ flex: 1 }}>
        <RNText>
          {parseBold(notification.message, {
            color: notification.read ? theme.colors.lightGray : "#fff",
            fontSize: theme.fontSizes.md,
          })}
        </RNText>
        <Text color={theme.colors.lightGray} size={theme.fontSizes.sm}>
          {formatDateLong(notification.created)}
        </Text>
      </View>
      {!notification.read && (
        <MaterialIcons
          name="fiber-manual-record"
          size={14}
          color="#4bb543"
          style={{ marginLeft: 6 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: theme.colors.darkerGray,
    borderRadius: theme.spacing.md,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    marginVertical: 2,
  },
  cardRead: {
    opacity: 0.7,
  },
});

function getIconAndColor(type: Notification["type"], read: boolean) {
  switch (type) {
    case "PROVIDER:NEW_REQUEST":
      return {
        icon: "account-plus",
        color: read ? "#999" : theme.colors.primaryBlue,
      };
    case "CLIENT:NEW_OFFER":
      return { icon: "handshake", color: read ? "#999" : "#e6b800" };
    case "PROVIDER:NEW_OFFER":
      return {
        icon: "account-cash",
        color: read ? "#999" : theme.colors.successGreen,
      };
    case "SYSTEM:INFO":
    default:
      return { icon: "information", color: read ? "#999" : "#888" };
  }
}

export function parseBold(text: string, baseStyle?: any) {
  const parts = text.split(/(\*[^*]+\*)/g);

  return parts.map((part, idx) => {
    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <Text
          key={idx}
          style={[baseStyle, { fontFamily: theme.fontFamily.bold }]}
        >
          {part.slice(1, -1)}
        </Text>
      );
    }
    return (
      <Text key={idx} style={baseStyle}>
        {part}
      </Text>
    );
  });
}
