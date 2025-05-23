import { useEffect, useRef, useState } from "react";
import { FlatList } from "react-native";

import { useAuthCtx } from "@/context/Auth";
import { Message } from "@/models/Message";
import Text from "./ui/Text";
import useList from "@/hooks/useList";
import useSubscription from "@/hooks/useSubscription";
import MessageField from "./MessageField";

type Props = {
  requestId: string;
};

export default function MessageList({ requestId }: Props) {
  const { user } = useAuthCtx();
  const flatListRef = useRef<FlatList<Message>>(null);

  const [initialMessages, { status }] = useList("message", {
    expand: "sender, request.service.provider",
    filter: `request.id = "${requestId}" && request.client = "${user.id}" || request.service.provider = "${user.id}"`,
    sort: "created",
  });

  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (status === "success") setMessages(initialMessages);
  }, [status]);

  useSubscription("message", "*", ({ action, record }) => {
    if (action === "create") {
      setMessages((prevMessages) => [...prevMessages, record]);
    }
  });

  if (status === "loading") return <Text>Loading...</Text>;

  if (status === "error") return <Text>Error loading messages</Text>;

  return (
    <FlatList
      ref={flatListRef}
      data={messages}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <MessageField message={item} currentUserId={user.id} />
      )}
      ListEmptyComponent={() => <Text>No messages yet</Text>}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      automaticallyAdjustKeyboardInsets
      contentContainerStyle={{ flexGrow: 1 }}
      onContentSizeChange={() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }}
    />
  );
}
