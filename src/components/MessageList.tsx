import { useEffect, useRef, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";

import { useAuthCtx } from "@/context/Auth";
import { Message } from "@/models/Message";
import Text from "./ui/Text";
import useList from "@/hooks/useList";
import useSubscription from "@/hooks/useSubscription";
import MessageField from "./MessageField";
import { theme } from "@/theme/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Loader from "./ui/Loader";

type Props = {
  requestId: string;
};

export default function MessageList({ requestId }: Props) {
  const { user } = useAuthCtx();
  const flatListRef = useRef<FlatList<Message>>(null);

  const [initialMessages, { status }] = useList("message", {
    expand: "sender, request.service.provider",
    filter: `request.id = "${requestId}"`,
    sort: "created",
  });

  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (status === "success") setMessages(initialMessages);
  }, [status]);

  useSubscription("message", "*", ({ action, record }) => {
    if (action === "create" && record.request === requestId) {
      setMessages((prevMessages) => [...prevMessages, record]);
    }
  });

  if (status === "loading")
    return (
      <View style={{ padding: 40 }}>
        <Loader />
      </View>
    );

  if (status == "error") return <ErrorMessages />;

  return (
    <FlatList
      ref={flatListRef}
      data={messages}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <MessageField message={item} currentUserId={user.id} />
      )}
      ListEmptyComponent={EmptyMessages}
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

function EmptyMessages() {
  return (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons
        name="message-text-outline"
        size={52}
        color={theme.colors.primaryBlue}
        style={{ marginBottom: 18 }}
      />
      <Text
        fontFamily="bold"
        size={theme.fontSizes.lg + 2}
        color={"white"}
        style={{ marginBottom: 6 }}
      >
        ¡Sin mensajes!
      </Text>
      <Text
        style={{ textAlign: "center" }}
        color={theme.colors.lightGray}
        size={theme.fontSizes.md}
      >
        No hay mensajes en esta conversación. ¡Envía el primero!
      </Text>
    </View>
  );
}

function ErrorMessages() {
  return (
    <View style={styles.errorContainer}>
      <MaterialCommunityIcons
        name="alert-circle-outline"
        size={52}
        color={theme.colors.redError}
        style={{ marginBottom: 16 }}
      />
      <Text
        fontFamily="bold"
        size={theme.fontSizes.lg + 2}
        color={"white"}
        style={{ marginBottom: 6 }}
      >
        ¡Ups! Hubo un error
      </Text>
      <Text
        style={{ textAlign: "center" }}
        color={theme.colors.lightGray}
        size={theme.fontSizes.md}
      >
        No pudimos cargar los mensajes. Por favor, revisa tu conexión o intenta
        nuevamente más tarde.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 40,
    paddingHorizontal: 30,
    opacity: 0.85,
  },
  errorContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
    paddingHorizontal: 30,
    opacity: 0.85,
  },
});
