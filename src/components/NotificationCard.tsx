import { View, StyleSheet, Text as RNText } from "react-native";
import { theme } from "@/theme/theme";

import Text from "./ui/Text";
import { NotificationWithUser } from "@/api/types";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { formatDateLong } from "@/utils/format";
import useColorScheme from "@/hooks/useColorScheme";

interface Props {
  notification: NotificationWithUser;
}

export default function NotificationCard({ notification }: Props) {
  const { icon, color } = getIconAndColor(notification.type, notification.read);
  const { colors } = useColorScheme();

  return (
    <View
      style={[
        { ...styles.card, backgroundColor: colors.darkerGray },
        notification.read && styles.cardRead,
      ]}
    >
      <MaterialCommunityIcons
        name={icon as any}
        size={28}
        color={color}
        style={{ marginRight: 10 }}
      />
      <View style={{ flex: 1 }}>
        <RNText>
          {parseBold(notification.message, {
            color: colors.text,
            fontSize: theme.fontSizes.md,
          })}
        </RNText>
        <Text color={colors.lightGray} size={theme.fontSizes.sm}>
          {formatDateLong(notification.created_at)}
        </Text>
      </View>
      {!notification.read ? (
        <MaterialIcons
          name="fiber-manual-record"
          size={14}
          color="#4bb543"
          style={{ marginLeft: 6 }}
        />
      ) : (
        <View style={{ width: 10, height: 10 }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderRadius: theme.spacing.md,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    marginVertical: 2,
  },
  cardRead: {
    opacity: 0.9,
  },
});

function getIconAndColor(type: NotificationWithUser["type"], read?: boolean) {
  const { colors } = useColorScheme();
  switch (type) {
    case "PROVIDER:NEW_REQUEST":
      return {
        icon: "account-plus",
        color: colors.primaryBlue,
      };
    case "CLIENT:NEW_OFFER":
      return { icon: "handshake", color: "#e6b800" };
    case "PROVIDER:NEW_OFFER":
      return {
        icon: "account-cash",
        color: colors.successGreen,
      };
    case "SYSTEM:INFO":
    default:
      return { icon: "information", color: "#888" };
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
