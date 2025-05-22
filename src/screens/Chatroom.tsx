import {
  StyleSheet,
  View,
  Keyboard,
  Platform,
  TouchableWithoutFeedback,
} from "react-native";
import React from "react";
import { StaticScreenProps } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import ChatHeader from "@/components/ChatHeader";
import NegotiationBlock from "@/components/NegotiationBlock";
import MessageList from "@/components/MessageList";
import ChatInput from "@/components/ChatInput";
import { theme } from "@/theme/theme";
import { ServiceRequest } from "@/models/ServiceRequest";

type Props = StaticScreenProps<{ request: ServiceRequest }>;

export default function Chatroom({ route }: Props) {
  const { request } = route.params;
  const { service } = request.expand!;

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <ChatHeader service={service} />
          <NegotiationBlock request={request} />
          <View style={styles.messageList}>
            <MessageList />
          </View>
          <ChatInput requestId={request.id} />
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    gap: theme.spacing.md,
  },
  messageList: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
  },
});
