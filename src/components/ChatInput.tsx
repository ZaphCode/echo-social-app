import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { theme } from "@/theme/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuthCtx } from "@/context/Auth";
import useMutate from "@/hooks/useMutate";
import { useNegotiationCtx } from "@/context/Negotiation";
import { isCanceled, isFinished } from "@/utils/negotiation";

const DEVICE_HEIGHT = Dimensions.get("window").height;

type Props = {
  requestId: string;
};

export default function ChatInput() {
  const { user } = useAuthCtx();
  const [message, setMessage] = useState("");
  const { request } = useNegotiationCtx();

  const { create, mutationState } = useMutate("message");

  const handleSend = async () => {
    if (message.trim() === "" || mutationState.status === "loading") return;

    await create({
      content: message,
      sender: user.id,
      request: request.id,
    });

    setMessage("");
  };

  const isDisabled =
    mutationState.status === "loading" ||
    isFinished(request) ||
    isCanceled(request);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? DEVICE_HEIGHT * 0.02 : 0}
    >
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Escribe un mensaje..."
          placeholderTextColor={theme.colors.lightGray}
          onSubmitEditing={handleSend}
          returnKeyType="send"
        />
        <TouchableOpacity
          onPress={handleSend}
          disabled={isDisabled}
          style={styles.sendButton}
        >
          <MaterialCommunityIcons
            name="send"
            size={24}
            color={theme.colors.primaryBlue}
            style={{ opacity: isDisabled ? 0.3 : 1 }}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: theme.spacing.sm + 4,
    paddingBottom: Platform.OS === "android" ? theme.spacing.md + 1 : 3,
    paddingHorizontal: theme.spacing.md,
    borderTopWidth: 1,
    borderColor: theme.colors.darkGray,
  },
  input: {
    flex: 1,
    height: 44,
    borderRadius: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md + 2,
    backgroundColor: theme.colors.darkGray,
    color: "white",
    fontFamily: theme.fontFamily.regular,
  },
  sendButton: {
    marginLeft: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 6,
  },
});
