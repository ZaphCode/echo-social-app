import { StyleSheet, ScrollView, View, Alert } from "react-native";
import { StaticScreenProps, useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { Feather } from "@expo/vector-icons";

import { theme } from "@/theme/theme";
import { useAuthCtx } from "@/context/Auth";
import { Service } from "@/models/Service";
import Text from "@/components/ui/Text";
import ServicePhotoCarousel from "@/components/ServicePhotoCarousel";
import Button from "@/components/ui/Button";
import Divider from "@/components/ui/Divider";
import useList from "@/hooks/useList";
import useCreate from "@/hooks/useCreate";
import { SlideModal } from "@/components/ui/SlideModal";
import RequestForm from "@/components/RequestForm";

type Props = StaticScreenProps<{ service: Service }>;

export default function ServiceOverview({ route }: Props) {
  const { service } = route.params;
  const { user } = useAuthCtx();

  const [hasRequested, setHasRequested] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const navigation = useNavigation();

  const { create, mutationState } = useCreate("service_request");
  const [serviceRequests, _] = useList("service_request", {
    filter: `service = "${service.id}" && client = "${user.id}" && status != "COMPLETED"`,
    expand: "service.provider, client",
  });

  useEffect(() => {
    if (serviceRequests?.length > 0) {
      console.log("Service request (Active):", serviceRequests[0].id);
      setHasRequested(true);
    }
  }, [serviceRequests]);

  const requestOrGotoMessage = async () => {
    return setModalVisible(true);
    if (hasRequested) {
      return navigation.navigate("Main", {
        screen: "Chatroom",
        params: { request: serviceRequests[0] },
      });
    }

    await create({
      service: service.id,
      client: user.id,
      agreed_price: 10,
      notes: "Hola, estoy interesado en este servicio",
      status: "PENDING",
    });

    if (mutationState.status === "error") {
      return Alert.alert(
        "Error",
        mutationState.error || "No se pudo crear la solicitud"
      );
    }

    setHasRequested(true);
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
          title={hasRequested ? "Mensaje" : "Solicitar"}
          onPress={requestOrGotoMessage}
          loading={mutationState.status === "loading"}
        />
        <Divider />
      </View>
      <SlideModal visible={modalVisible} onClose={() => setModalVisible(false)}>
        <RequestForm />
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
