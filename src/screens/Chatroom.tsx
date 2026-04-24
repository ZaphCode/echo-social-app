import { StyleSheet, View } from "react-native";
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
import useModal from "@/hooks/useModal";
import ReviewForm from "@/components/ReviewForm";
import useCheckReviews from "@/hooks/useCheckReviews";
import { useAuthCtx } from "@/context/Auth";
import useColorScheme from "@/hooks/useColorScheme";
import { useQueryClient } from "@tanstack/react-query";

type Props = StaticScreenProps<{ request: ServiceRequest }>;

export default function Chatroom({ route }: Props) {
  const { colors } = useColorScheme();
  const { user: authUser } = useAuthCtx();
  const { request } = route.params;
  const service = (request as any).service || {} as any;
  const client = (request as any).client_profile || {} as any;
  const provider = service?.provider || {} as any;
  const queryClient = useQueryClient();

  const [offerModalVisible, openOfferModal, closeOfferModal] = useModal();
  const [reviewModalVisible, openReviewModal, closeReviewModal] = useModal();
  const { hasReviewed, markAsReviewed } = useCheckReviews(authUser, request);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <NegotiationProvider
        initialRequest={request}
        service={service}
        client={client}
        provider={provider}
      >
        <View>
          <ChatHeader />
          <NegotiationStatusBar />
          <NegotiationBlock
            openOfferFn={openOfferModal}
            openReviewFn={openReviewModal}
            hasReviewed={hasReviewed}
          />
        </View>
        <View style={styles.messageList}>
          <MessageList requestId={request.id} />
        </View>
        <ChatInput />
        <SlideModal visible={offerModalVisible} onClose={closeOfferModal}>
          <View style={{ padding: theme.spacing.md }}>
            <RequestForm
              service={service}
              requestId={request.id}
              onSuccess={closeOfferModal}
            />
          </View>
        </SlideModal>
        <SlideModal visible={reviewModalVisible} onClose={closeReviewModal}>
          <ReviewForm
            onSuccess={() => {
              closeReviewModal();
              queryClient.invalidateQueries({ queryKey: ["review"] });
              markAsReviewed();
            }}
          />
        </SlideModal>
      </NegotiationProvider>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  messageList: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
  },
});
