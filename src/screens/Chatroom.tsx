import { StyleSheet, View } from "react-native";
import { useState } from "react";
import { StaticScreenProps } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

import { theme } from "@/theme/theme";
import { SlideModal } from "@/components/ui/SlideModal";
import { ServiceRequest } from "@/models/ServiceRequest";
import { NegotiationProvider } from "@/context/Negotiation";
import ChatHeader from "@/components/ChatHeader";
import NegotiationBlock from "@/components/NegotiationBlock";
import MessageList from "@/components/MessageList";
import ChatInput from "@/components/ChatInput";
import RequestForm from "@/components/forms/RequestForm";
import NegotiationStatusBar from "@/components/NegotiationStatusBar";

type Props = StaticScreenProps<{ request: ServiceRequest }>;

export default function Chatroom({ route }: Props) {
  const { request } = route.params;
  const { service, client } = request.expand!;
  const { provider } = service.expand!;

  const [modalVisible, setModalVisible] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <NegotiationProvider
        initialRequest={request}
        service={service}
        client={client}
        provider={provider}
      >
        <View>
          <ChatHeader />
          <NegotiationStatusBar />
          <NegotiationBlock openModalFn={() => setModalVisible(true)} />
        </View>
        <View style={styles.messageList}>
          <MessageList requestId={request.id} />
        </View>
        <ChatInput />
        <SlideModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
        >
          <View style={{ padding: theme.spacing.md }}>
            <RequestForm
              service={service}
              requestId={request.id}
              onSuccess={() => {
                setModalVisible(false);
              }}
            />
          </View>
        </SlideModal>
      </NegotiationProvider>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  messageList: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
  },
});
