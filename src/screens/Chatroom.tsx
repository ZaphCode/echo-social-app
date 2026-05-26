import { StyleSheet, View } from "react-native";
import { StaticScreenProps } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";

import { reviewsKeys } from "@/api/reviews";
import { ServiceRequestWithRelations } from "@/api/types";
import { getRequestProvider, getRequestSubject } from "@/utils/negotiationSubject";
import { theme } from "@/theme/theme";
import { SlideModal } from "@/components/ui/SlideModal";
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
import useChatPresence from "@/hooks/useChatPresence";

type Props = StaticScreenProps<{ request: ServiceRequestWithRelations }>;

export default function Chatroom({ route }: Props) {
  const { colors } = useColorScheme();
  const { user: authUser } = useAuthCtx();
  const { request } = route.params;
  const subject = getRequestSubject(request);
  const service = request.service_detail;
  const client = request.client_profile || ({} as any);
  const provider = getRequestProvider(request);
  const queryClient = useQueryClient();

  const [offerModalVisible, openOfferModal, closeOfferModal] = useModal();
  const [reviewModalVisible, openReviewModal, closeReviewModal] = useModal();
  const { hasReviewed, markAsReviewed } = useCheckReviews(
    authUser,
    request,
    subject
  );
  const presentUserIds = useChatPresence(request.id, authUser.id);
  const offerRecipient =
    authUser.id === client.id
      ? { recipientId: provider.id, recipientType: "provider" as const }
      : { recipientId: client.id, recipientType: "client" as const };
  const isOfferRecipientInChat = presentUserIds.includes(
    offerRecipient.recipientId
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <NegotiationProvider
        initialRequest={request}
        service={service}
        subject={subject}
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
            shouldNotifyCounterparty={!isOfferRecipientInChat}
          />
        </View>
        <View style={styles.messageList}>
          <MessageList requestId={request.id} />
        </View>
        <ChatInput />
        <SlideModal visible={offerModalVisible} onClose={closeOfferModal}>
          <View style={{ padding: theme.spacing.md }}>
            <RequestForm
              service={service ?? undefined}
              subject={subject}
              requestId={request.id}
              offerNotification={
                isOfferRecipientInChat ? undefined : offerRecipient
              }
              onSuccess={closeOfferModal}
            />
          </View>
        </SlideModal>
        <SlideModal visible={reviewModalVisible} onClose={closeReviewModal}>
          <ReviewForm
            onSuccess={() => {
              closeReviewModal();
              queryClient.invalidateQueries({
                queryKey:
                  subject.type === "service"
                    ? reviewsKeys.byService(subject.id)
                    : reviewsKeys.byReviewerAndContracting(authUser.id, subject.id),
              });
              queryClient.invalidateQueries({
                queryKey:
                  subject.type === "service"
                    ? reviewsKeys.byReviewerAndService(authUser.id, subject.id)
                    : reviewsKeys.byReviewerAndContracting(authUser.id, subject.id),
              });
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
