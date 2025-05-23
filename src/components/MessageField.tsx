import React from "react";
import { View, StyleSheet } from "react-native";
import Text from "./ui/Text";
import { Message as MessageType } from "@/models/Message";
import { theme } from "@/theme/theme";

type Props = {
  message: MessageType;
  currentUserId: string;
};

export default function Message({ message, currentUserId }: Props) {
  const isSender = message.sender === currentUserId;

  return (
    <View
      style={[styles.container, isSender ? styles.sender : styles.receiver]}
    >
      <Text
        style={[
          styles.text,
          isSender ? styles.textSender : styles.textReceiver,
        ]}
      >
        {message.content}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    maxWidth: "75%",
    marginVertical: theme.spacing.xs,
    padding: theme.spacing.sm,
    borderRadius: 12,
  },
  sender: {
    backgroundColor: theme.colors.secondaryBlue,
    alignSelf: "flex-end",
    borderTopRightRadius: 0,
  },
  receiver: {
    backgroundColor: theme.colors.darkGray,
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
    color: theme.colors.lightGray,
  },
});
