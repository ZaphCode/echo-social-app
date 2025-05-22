import { FlatList, View } from "react-native";
import React from "react";
import useList from "@/hooks/useList";
import Text from "./ui/Text";
import { useAuthCtx } from "@/context/Auth";

export default function MessageList() {
  const { user } = useAuthCtx();

  const [messages, { status }] = useList("message", {
    expand: "sender, request",
  });

  if (status === "loading") {
    return <Text>Loading...</Text>;
  }

  if (status === "error") {
    return <Text>Error loading messages</Text>;
  }

  return (
    <FlatList
      data={messages}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View>
          <Text>{item.content}</Text>
        </View>
      )}
      contentContainerStyle={{ paddingBottom: 100 }}
      ListEmptyComponent={() => <Text>No messages yet</Text>}
    />
  );
}
