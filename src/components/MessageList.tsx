import { useEffect, useRef } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { useQueryClient } from "@tanstack/react-query";

import { ChatMessage } from "@/chat/types";
import { useChatSync } from "@/chat/ChatSyncProvider";
import useChatMessages from "@/chat/useChatMessages";
import { markRequestMessagesRead } from "@/chat/messages";
import { chatMessagesKeys } from "@/chat/sync";
import { useAuthCtx } from "@/context/Auth";
import Text from "./ui/Text";
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
  const queryClient = useQueryClient();
  const { isOnline, retryMessage } = useChatSync();
  const flatListRef = useRef<FlatList<ChatMessage>>(null);
  const messagesQuery = useChatMessages(requestId);

  useEffect(() => {
    if (!messagesQuery.data) return;

    const latestVisibleTimestamp = messagesQuery.data.reduce(
      (latest, message) =>
        Math.max(latest, new Date(message.created_at_client).getTime()),
      Date.now()
    );

    markRequestMessagesRead({
      requestId,
      userId: user.id,
      readAtClient: new Date(latestVisibleTimestamp).toISOString(),
    })
      .then(() => {
        queryClient.invalidateQueries({
          queryKey: chatMessagesKeys.unreadCountsForUser(user.id),
        });
      })
      .catch(() => {
        // Reading state is best-effort; the chat should still render normally.
      });
  }, [messagesQuery.data, queryClient, requestId, user.id]);

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
      keyExtractor={(item) => item.local_id}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <MessageField
          message={item}
          currentUserId={user.id}
          isOnline={isOnline}
          onRetry={retryMessage}
        />
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
