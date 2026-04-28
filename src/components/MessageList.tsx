import { useRef } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { listMessagesByRequest, messagesKeys } from "@/api/messages";
import { MessageWithSender } from "@/api/types";
import { useAuthCtx } from "@/context/Auth";
import { Message } from "@/models/Message";
import Text from "./ui/Text";
import useSubscription from "@/hooks/useSubscription";
import MessageField from "./MessageField";
import { theme } from "@/theme/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Loader from "./ui/Loader";
import useColorScheme from "@/hooks/useColorScheme";

type Props = {
  requestId: string;
};

export default function MessageList({ requestId }: Props) {
  const { user } = useAuthCtx();
  const flatListRef = useRef<FlatList<Message>>(null);
  const queryClient = useQueryClient();

  const messagesQuery = useQuery({
    queryKey: messagesKeys.byRequest(requestId),
    queryFn: () => listMessagesByRequest(requestId),
  });

  useSubscription<Message>("message", "*", async ({ action, record }) => {
    if (action === "INSERT" && record.request === requestId) {
      queryClient.setQueryData<MessageWithSender[]>(
        messagesKeys.byRequest(requestId),
        (currentMessages) => mergeMessages(currentMessages, record)
      );
    }
  });

  if (messagesQuery.isPending)
    return (
      <View style={{ padding: 40 }}>
        <Loader />
      </View>
    );

  if (messagesQuery.isError) return <ErrorMessages />;

  return (
    <FlatList
      ref={flatListRef}
      data={messagesQuery.data ?? []}
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

function mergeMessages(
  currentMessages: MessageWithSender[] | undefined,
  newMessage: Message
) {
  const messages = currentMessages ?? [];
  const alreadyExists = messages.some((message) => message.id === newMessage.id);

  if (alreadyExists) return messages;

  return [...messages, newMessage as MessageWithSender].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
}

function EmptyMessages() {
  const { colors } = useColorScheme();
  return (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons
        name="message-text-outline"
        size={52}
        color={colors.primaryBlue}
        style={{ marginBottom: 18 }}
      />
      <Text
        fontFamily="bold"
        size={theme.fontSizes.lg + 2}
        color={colors.text}
        style={{ marginBottom: 6 }}
      >
        ¡Sin mensajes!
      </Text>
      <Text
        style={{ textAlign: "center" }}
        color={colors.lightGray}
        size={theme.fontSizes.md}
      >
        No hay mensajes en esta conversación. ¡Envía el primero!
      </Text>
    </View>
  );
}

function ErrorMessages() {
  const { colors } = useColorScheme();
  return (
    <View style={styles.errorContainer}>
      <MaterialCommunityIcons
        name="alert-circle-outline"
        size={52}
        color={colors.redError}
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
        color={colors.lightGray}
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
