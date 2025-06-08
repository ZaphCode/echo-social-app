import { StyleSheet, ScrollView, View } from "react-native";
import { StaticScreenProps, useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { Feather } from "@expo/vector-icons";

import { theme } from "@/theme/theme";
import { useAuthCtx } from "@/context/Auth";
import { Service } from "@/models/Service";
import { ServiceRequest } from "@/models/ServiceRequest";
import { SlideModal } from "@/components/ui/SlideModal";
import Text from "@/components/ui/Text";
import ServicePhotoCarousel from "@/components/ServicePhotoCarousel";
import Button from "@/components/ui/Button";
import Divider from "@/components/ui/Divider";
import useList from "@/hooks/useList";
import RequestForm from "@/components/forms/RequestForm";
import ReviewSection from "@/components/ReviewSection";
import useModal from "@/hooks/useModal";

type Props = StaticScreenProps<{ service: Service }>;

export default function ServiceOverview({ route }: Props) {
  const { service } = route.params;
  const { user } = useAuthCtx();

  const [activeRequest, setActiveRequest] = useState<ServiceRequest | null>();
  const [requestVisible, openRequestModal, closeRequestModal] = useModal();
  const navigation = useNavigation();

  const [serviceRequests, { status }] = useList("service_request", {
    filter: `service = "${service.id}" && client = "${user.id} && agreement_state != "FINISHED"`,
    expand: "service.provider, client",
  });

  useEffect(() => {
    if (status === "success" && serviceRequests.length > 0) {
      setActiveRequest(serviceRequests[0]);
    }
  }, [serviceRequests, status]);

  const requestOrGotoMessage = async () => {
    if (!activeRequest) return openRequestModal();

    return navigation.navigate("Main", {
      screen: "Chatroom",
      params: { request: activeRequest },
    });
  };

  return (
    <ScrollView style={styles.container}>
      <ServicePhotoCarousel photos={service.photos} serviceId={service.id} />
      <View style={{ gap: theme.spacing.md }}>
        <Text color="white" fontFamily="bold" size={theme.fontSizes.xxl}>
          {service.name}
        </Text>
        <View style={styles.infoContainer}>
          <View style={styles.profileContainer}>
            <Feather name="user" size={25} color={theme.colors.lightGray} />
            <Text size={theme.fontSizes.md + 1}>
              {service.expand!.provider.name}
            </Text>
          </View>
          <Text
            color={theme.colors.primaryBlue}
            size={theme.fontSizes.md + 2}
            fontFamily="bold"
          >{`$${service.base_price}`}</Text>
        </View>
        <View style={{ padding: theme.spacing.sm, gap: 5 }}>
          <Text size={theme.fontSizes.lg} color="white" fontFamily="bold">
            Descripción
          </Text>
          <Text size={theme.fontSizes.lg} color="white">
            {service.description}
          </Text>
        </View>
        <Button
          title={activeRequest ? "Mensaje" : "Solicitar"}
          onPress={requestOrGotoMessage}
          disabled={user.id === service.provider}
        />
        <Divider />
        <ReviewSection service={service} authUser={user} />
      </View>
      <SlideModal visible={requestVisible} onClose={closeRequestModal}>
        <RequestForm
          service={service}
          defaultPrice={service.base_price.toString()}
          onSuccess={(newRequest) => {
            setActiveRequest(newRequest);
            closeRequestModal();
          }}
        />
      </SlideModal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.sm + 4,
  },
  infoContainer: {
    paddingHorizontal: theme.spacing.sm,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
});
