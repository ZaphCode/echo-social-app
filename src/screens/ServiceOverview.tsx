import { StyleSheet, ScrollView, View, Pressable } from "react-native";
import { StaticScreenProps, useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { Feather } from "@expo/vector-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import {
  listServiceRequestsForClient,
  serviceRequestsKeys,
} from "@/api/serviceRequests";
import { ServiceRequestWithRelations, ServiceWithProvider } from "@/api/types";
import { theme } from "@/theme/theme";
import { useAuthCtx } from "@/context/Auth";
import { SlideModal } from "@/components/ui/SlideModal";
import Text from "@/components/ui/Text";
import ServicePhotoCarousel from "@/components/ServicePhotoCarousel";
import Button from "@/components/ui/Button";
import Divider from "@/components/ui/Divider";
import RequestForm from "@/components/forms/RequestForm";
import ReviewSection from "@/components/ReviewSection";
import useModal from "@/hooks/useModal";
import useColorScheme from "@/hooks/useColorScheme";

type Props = StaticScreenProps<{ service: ServiceWithProvider }>;

export default function ServiceOverview({ route }: Props) {
  const { service } = route.params;
  const { user } = useAuthCtx();
  const queryClient = useQueryClient();

  const [activeRequest, setActiveRequest] =
    useState<ServiceRequestWithRelations | null>(null);
  const [requestVisible, openRequestModal, closeRequestModal] = useModal();
  const navigation = useNavigation();

  const requestsQuery = useQuery({
    queryKey: serviceRequestsKeys.byServiceAndClient(service.id, user.id),
    queryFn: () => listServiceRequestsForClient(service.id, user.id),
  });

  useEffect(() => {
    if (requestsQuery.isSuccess && requestsQuery.data.length > 0) {
      setActiveRequest(requestsQuery.data[0]);
    } else if (requestsQuery.isSuccess) {
      setActiveRequest(null);
    }
  }, [requestsQuery.data, requestsQuery.isSuccess]);

  const goToUserProfile = () => {
    if (user.id === service.provider) {
      return navigation.navigate("Main", {
        screen: "Tabs",
        params: { screen: "Profile" },
      });
    }
    navigation.navigate("Main", {
      screen: "UserProfile",
      params: {
        user: service.provider_profile || {
          id: service.provider,
          name: "Proveedor",
        },
      },
    });
  };

  const requestOrGotoMessage = async () => {
    if (!activeRequest) return openRequestModal();
    return navigation.navigate("Main", {
      screen: "Chatroom",
      params: { request: activeRequest },
    });
  };

  const { colors } = useColorScheme();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ServicePhotoCarousel photos={service.photos} serviceId={service.id} />
      <View style={{ gap: theme.spacing.md }}>
        <Text color={colors.text} fontFamily="bold" size={theme.fontSizes.xxl}>
          {service.name}
        </Text>
        <View style={styles.infoContainer}>
          <Pressable onPress={goToUserProfile} style={styles.profileContainer}>
            <Feather name="user" size={25} color={colors.lightGray} />
            <Text
              size={theme.fontSizes.md + 1}
              style={{ textDecorationLine: "underline" }}
            >
              {service.provider_profile?.name || "Proveedor"}
            </Text>
          </Pressable>
          <Text
            color={theme.colors.primaryBlue}
            size={theme.fontSizes.md + 2}
            fontFamily="bold"
          >{`$${service.base_price}`}</Text>
        </View>
        <View style={{ padding: theme.spacing.sm, gap: 5 }}>
          <Text size={theme.fontSizes.lg} color={colors.text} fontFamily="bold">
            Descripción
          </Text>
          <Text size={theme.fontSizes.lg} color={colors.lightGray}>
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
            if (newRequest) {
              setActiveRequest(newRequest);
            }
            closeRequestModal();
            queryClient.invalidateQueries({
              queryKey: serviceRequestsKeys.byServiceAndClient(service.id, user.id),
            });
            queryClient.invalidateQueries({
              queryKey: serviceRequestsKeys.allForUser(user.id),
            });
          }}
        />
      </SlideModal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
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
