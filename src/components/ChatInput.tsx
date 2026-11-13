import { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useChatSync } from "@/chat/ChatSyncProvider";
import { insertPendingMessage } from "@/chat/messages";
import { chatMessagesKeys } from "@/chat/sync";
import { useAuthCtx } from "@/context/Auth";
import { useNegotiationCtx } from "@/context/Negotiation";
import useTheme from "@/hooks/useTheme";
import { fonts, radius } from "@/theme/theme";
import { isCanceled } from "@/utils/negotiation";

export default function ChatInput() {
  const { user } = useAuthCtx();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { flushPendingMessages } = useChatSync();
  const { request } = useNegotiationCtx();
  const [message, setMessage] = useState("");

  const isDisabled = isCanceled(request);
  const canSend = !isDisabled && message.trim().length > 0;

  const handleSend = async () => {
    const content = message.trim();
    if (!content || isDisabled) return;

    const timestamp = new Date().toISOString();
    const randomSuffix = Math.random().toString(36).slice(2, 10);

    await insertPendingMessage({
      localId: `local:${timestamp}:${randomSuffix}`,
      clientId: `client:${user.id}:${timestamp}:${randomSuffix}`,
      requestId: request.id,
      senderId: user.id,
      content,
      createdAtClient: timestamp,
    });
    setMessage("");

    await queryClient.invalidateQueries({ queryKey: chatMessagesKeys.byRequest(request.id) });
    await flushPendingMessages();
  };

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <View style={[styles.field, { backgroundColor: colors.surface, borderColor: colors.line }]}>
        <TextInput
          style={[styles.input, { color: colors.text }]}
          value={message}
          onChangeText={setMessage}
          placeholder={isDisabled ? "Esta solicitud fue cancelada" : "Escribe un mensaje…"}
          placeholderTextColor={colors.textSubtle}
          editable={!isDisabled}
          multiline
          accessibilityLabel="Mensaje"
        />
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Enviar mensaje"
        disabled={!canSend}
        onPress={handleSend}
        style={({ pressed }) => [
          styles.send,
          {
            backgroundColor: canSend ? colors.accent : colors.surface2,
            transform: [{ scale: pressed ? 0.94 : 1 }],
          },
        ]}
      >
        <Feather name="arrow-up" size={22} color={canSend ? colors.onAccent : colors.textSubtle} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  field: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: 18,
    justifyContent: "center",
  },
  input: {
    fontFamily: fonts.regular,
    fontSize: 15,
    paddingTop: 12,
    paddingBottom: 12,
  },
  send: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
});
