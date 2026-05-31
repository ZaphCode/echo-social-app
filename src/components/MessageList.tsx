import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  View,
} from "react-native";
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

const BOTTOM_OFFSET_THRESHOLD = 48;

export default function MessageList({ requestId }: Props) {
  const { user } = useAuthCtx();
  const queryClient = useQueryClient();
  const { isOnline, retryMessage } = useChatSync();
  const flatListRef = useRef<FlatList<ChatMessage>>(null);
  const latestReadAtRef = useRef<string | null>(null);
  const isAtBottomRef = useRef(true);
  const messagesQuery = useChatMessages(requestId);
  const messages = messagesQuery.data ?? [];
  const messagesForList = useMemo(() => [...messages].reverse(), [messages]);
  const newestMessageId = messagesForList[0]?.local_id ?? null;
  const showInitialSyncLoader =
    messagesForList.length === 0 && messagesQuery.isSyncingRemote;

  useEffect(() => {
    latestReadAtRef.current = null;
    isAtBottomRef.current = true;
  }, [requestId]);

  useEffect(() => {
    if (!newestMessageId || !isAtBottomRef.current) return;

    requestAnimationFrame(() => {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    });
  }, [newestMessageId]);

  useEffect(() => {
    if (!messagesQuery.data) return;

    const latestVisibleTimestamp =
      messagesQuery.data.length > 0
        ? messagesQuery.data.reduce(
            (latest, message) =>
              Math.max(
                latest,
                new Date(
                  message.created_at_server ?? message.created_at_client,
                ).getTime(),
              ),
            0,
          )
        : Date.now();
    const latestVisibleTimestampIso = new Date(
      latestVisibleTimestamp,
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
    [isOnline, retryMessage, user.id],
  );

  const keyExtractor = useCallback((item: ChatMessage) => item.local_id, []);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      isAtBottomRef.current =
        event.nativeEvent.contentOffset.y <= BOTTOM_OFFSET_THRESHOLD;
    },
    [],
  );

  const renderEmptyComponent = useCallback(
    () => (
      <View style={styles.invertedListPlaceholder}>
        {showInitialSyncLoader ? <LoadingMessages /> : <EmptyMessages />}
      </View>
    ),
    [showInitialSyncLoader],
  );

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
      data={messagesForList}
      inverted
      keyExtractor={keyExtractor}
      showsVerticalScrollIndicator={false}
      renderItem={renderMessage}
      extraData={isOnline}
      ListEmptyComponent={renderEmptyComponent}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      onScroll={handleScroll}
      scrollEventThrottle={32}
      contentContainerStyle={{ flexGrow: 1 }}
      maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
      initialNumToRender={12}
      maxToRenderPerBatch={8}
      updateCellsBatchingPeriod={50}
      windowSize={7}
      removeClippedSubviews
    />
  );
}

function LoadingMessages() {
  return (
    <View style={{ padding: 40, marginBottom: 200 }}>
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
    marginBottom: 200,
  },
  errorContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
    paddingHorizontal: 30,
    opacity: 0.85,
    marginBottom: 200,
  },
  invertedListPlaceholder: {
    transform: [{ scaleY: -1 }],
  },
});
