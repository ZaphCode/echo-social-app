import { View } from "react-native";
import React from "react";
import useList from "@/hooks/useList";
import Text from "./ui/Text";

export default function MessageList() {
  const [messages, { status }] = useList("message", {
    expand: "sender, receiver, request",
  });

  if (status === "loading") {
    return <Text>Loading...</Text>;
  }

  if (status === "error") {
    return <Text>Error loading messages</Text>;
  }

  if (!messages || messages.length === 0) {
    return <Text>No messages found</Text>;
  }

  return (
    <View>
      {messages.map((message) => (
        <View key={message.id}>
          <Text>{message.content}</Text>
        </View>
      ))}
    </View>
  );
}
