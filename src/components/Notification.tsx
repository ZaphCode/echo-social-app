import React from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { theme } from "@/theme/theme";
import Text from "@/components/ui/Text";
import { Ionicons } from "@expo/vector-icons";

export type NotificationType = "application" | "offer" | "message" | "status" | "review";

export interface NotificationData {
  id: string;
  type: NotificationType;
  user: {
    name: string;
    avatar: string;
  };
  content: string;
  job?: string;
  status?: "pending" | "accepted" | "rejected";
  budget?: string;
  message?: string;
  rating?: number;
  time: string;
}

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case "application":
      return "document-text";
    case "offer":
      return "briefcase";
    case "message":
      return "chatbubble";
    case "status":
      return "checkmark-circle";
    case "review":
      return "star";
    default:
      return "notifications";
  }
};

const getNotificationColor = (type: NotificationType) => {
  switch (type) {
    case "application":
      return theme.colors.primaryBlue;
    case "offer":
      return theme.colors.secondaryBlue;
    case "message":
      return theme.colors.primaryBlue;
    case "status":
      return "#4CAF50";
    case "review":
      return "#FFC107"; 
    default:
      return theme.colors.lightGray;
  }
};

interface NotificationProps {
  data: NotificationData;
  onPress?: () => void;
}

export default function Notification({ data, onPress }: NotificationProps) {
  return (
    <TouchableOpacity style={styles.notificationItem} onPress={onPress}>
      <View style={styles.notificationContent}>
        <View style={styles.avatarContainer}>
          <View style={[styles.iconContainer, { backgroundColor: getNotificationColor(data.type) }]}>
            <Ionicons name={getNotificationIcon(data.type)} size={16} color="white" />
          </View>
        </View>
        <View style={styles.textContainer}>
          <View style={styles.notificationText}>
            <Text fontFamily="bold" color="white" size={theme.fontSizes.sm}>
              {`${data.user.name} `}
            </Text>
            <Text color="white" size={theme.fontSizes.sm}>
              {data.content}
            </Text>
            {data.job && (
              <>
                <Text color="white" size={theme.fontSizes.sm}>
                  {" "}
                </Text>
                <Text fontFamily="bold" color="white" size={theme.fontSizes.sm}>
                  {`"${data.job}"`}
                </Text>
              </>
            )}
            {data.budget && (
              <>
                <Text color="white" size={theme.fontSizes.sm}>
                  {" "}
                </Text>
                <Text color="lightGray" size={theme.fontSizes.sm}>
                  {`(${data.budget})`}
                </Text>
              </>
            )}
            {data.message && (
              <>
                <Text color="white" size={theme.fontSizes.sm}>
                  {" "}
                </Text>
                <Text color="lightGray" size={theme.fontSizes.sm}>
                  {`"${data.message}"`}
                </Text>
              </>
            )}
            {data.rating && (
              <>
                <Text color="white" size={theme.fontSizes.sm}>
                  {" "}
                </Text>
                <View style={styles.ratingContainer}>
                  {[...Array(data.rating)].map((_, i) => (
                    <Ionicons key={i} name="star" size={12} color="#FFC107" />
                  ))}
                </View>
              </>
            )}
          </View>
          <Text color="lightGray" size={theme.fontSizes.sm}>
            {data.time}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  notificationItem: {
    paddingVertical: theme.spacing.sm,
  },
  notificationContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing.sm,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.darkGray,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  notificationText: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    gap: 2,
  },
}); 