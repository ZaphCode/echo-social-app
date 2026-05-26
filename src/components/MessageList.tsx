import { useCallback, useEffect, useRef } from "react";
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
  const latestReadAtRef = useRef<string | null>(null);
  const messagesQuery = useChatMessages(requestId);
  const messages = messagesQuery.data ?? [];

  useEffect(() => {
    latestReadAtRef.current = null;
  }, [requestId]);

  useEffect(() => {
    if (!messagesQuery.data) return;

    const latestVisibleTimestamp =
      messagesQuery.data.length > 0
        ? messagesQuery.data.reduce(
            (latest, message) =>
              Math.max(latest, new Date(message.created_at_client).getTime()),
            0
          )
        : Date.now();
    const latestVisibleTimestampIso = new Date(
      latestVisibleTimestamp
    ).toISOString();

    if (
      latestReadAtRef.current &&
      latestReadAtRef.current >= latestVisibleTimestampIso
    ) {
      return;
    }

    latestReadAtRef.current = latestVisibleTimestampIso;

    markRequestMessagesRead({
      requestId,
      userId: user.id,
      readAtClient: latestVisibleTimestampIso,
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

  const renderMessage = useCallback(
    ({ item }: { item: ChatMessage }) => (
      <MessageField
        message={item}
        currentUserId={user.id}
        isOnline={isOnline}
        onRetry={retryMessage}
      />
    ),
    [isOnline, retryMessage, user.id]
  );

  const keyExtractor = useCallback((item: ChatMessage) => item.local_id, []);

  const scrollToEnd = useCallback(() => {
    flatListRef.current?.scrollToEnd({ animated: false });
  }, []);

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
      data={messages}
      keyExtractor={keyExtractor}
      showsVerticalScrollIndicator={false}
      renderItem={renderMessage}
      extraData={isOnline}
      ListHeaderComponent={
        messagesQuery.isSyncingRemote ? <SyncingMessages /> : null
      }
      ListEmptyComponent={
        messagesQuery.isSyncingRemote ? LoadingMessages : EmptyMessages
      }
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      automaticallyAdjustKeyboardInsets
      contentContainerStyle={{ flexGrow: 1 }}
      initialNumToRender={16}
      maxToRenderPerBatch={12}
      updateCellsBatchingPeriod={60}
      windowSize={9}
      removeClippedSubviews
      onContentSizeChange={scrollToEnd}
    />
  );
}

function SyncingMessages() {
  const { colors } = useColorScheme();

  return (
    <View style={styles.syncingContainer}>
      <Loader />
      <Text color={colors.lightGray} size={theme.fontSizes.sm}>
        Sincronizando mensajes...
      </Text>
    </View>
  );
}

function LoadingMessages() {
  return (
    <View style={{ padding: 40 }}>
      <Loader />
    </View>
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
  syncingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
});
