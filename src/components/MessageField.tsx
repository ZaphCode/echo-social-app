import React from "react";
import { View, StyleSheet } from "react-native";
import Text from "./ui/Text";
import { Message as MessageType } from "@/models/Message";
import { theme } from "@/theme/theme";
import useColorScheme from "@/hooks/useColorScheme";

type Props = {
  message: MessageType;
  currentUserId: string;
};

export default function Message({ message, currentUserId }: Props) {
  const { colors } = useColorScheme();
  const isSender = message.sender === currentUserId;

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
  });

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
