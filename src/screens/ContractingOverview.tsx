import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { StaticScreenProps, useNavigation } from "@react-navigation/native";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import {
  listContractingApplicationsForProvider,
  serviceRequestsKeys,
} from "@/api/serviceRequests";
import { ContractingWithOwner, ServiceRequestWithRelations } from "@/api/types";
import { contractingsKeys } from "@/api/contractings";
import { theme } from "@/theme/theme";
import { useAuthCtx } from "@/context/Auth";
import { SlideModal } from "@/components/ui/SlideModal";
import Button from "@/components/ui/Button";
import Divider from "@/components/ui/Divider";
import RequestForm from "@/components/forms/RequestForm";
import ServicePhotoCarousel from "@/components/ServicePhotoCarousel";
import Text from "@/components/ui/Text";
import useColorScheme from "@/hooks/useColorScheme";
import useModal from "@/hooks/useModal";

type Props = StaticScreenProps<{ contracting: ContractingWithOwner }>;

export default function ContractingOverview({ route }: Props) {
  const { contracting } = route.params;
  const { user } = useAuthCtx();
  const { colors } = useColorScheme();
  const queryClient = useQueryClient();
  const navigation = useNavigation();
  const [activeRequest, setActiveRequest] =
    useState<ServiceRequestWithRelations | null>(null);
  const [requestVisible, openRequestModal, closeRequestModal] = useModal();
  const isOwner = user.id === contracting.owner;
  const canApply = user.role === "provider" && !isOwner && !contracting.is_closed;

  const applicationsQuery = useQuery({
    queryKey: serviceRequestsKeys.byContractingAndProvider(
      contracting.id,
      user.id
    ),
    queryFn: () => listContractingApplicationsForProvider(contracting.id, user.id),
    enabled: user.role === "provider",
  });

  useEffect(() => {
    if (applicationsQuery.isSuccess && applicationsQuery.data.length > 0) {
      setActiveRequest(applicationsQuery.data[0]);
    } else if (applicationsQuery.isSuccess) {
      setActiveRequest(null);
    }
  }, [applicationsQuery.data, applicationsQuery.isSuccess]);

  const goToOwnerProfile = () => {
    if (isOwner) {
      return (navigation.navigate as any)("Main", {
        screen: "Tabs",
        params: { screen: "Profile" },
      });
    }

    (navigation.navigate as any)("Main", {
      screen: "UserProfile",
      params: {
        user: contracting.owner_profile || {
          id: contracting.owner,
          name: "Publicador",
        },
      },
    });
  };

  const applyOrGotoMessage = async () => {
    if (contracting.is_closed) return;
    if (!activeRequest) return openRequestModal();
    return (navigation.navigate as any)("Main", {
      screen: "Chatroom",
      params: { request: activeRequest },
    });
  };

  const buttonTitle = contracting.is_closed
    ? isOwner
      ? "Contratación cerrada"
      : "Contratación completada"
    : activeRequest
      ? "Mensaje"
      : canApply
        ? "Aplicar"
        : isOwner
          ? "Tu contratación"
          : "Solo proveedores pueden aplicar";

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ServicePhotoCarousel
        photos={contracting.photos}
        serviceId={contracting.id}
      />
      <View style={{ gap: theme.spacing.md }}>
        <Text color={colors.text} fontFamily="bold" size={theme.fontSizes.xxl}>
          {contracting.name}
        </Text>
        <View style={styles.infoContainer}>
          <Pressable onPress={goToOwnerProfile} style={styles.profileContainer}>
            <Feather name="user" size={25} color={colors.lightGray} />
            <Text
              size={theme.fontSizes.md + 1}
              style={{ textDecorationLine: "underline" }}
            >
              {contracting.owner_profile?.name || "Publicador"}
            </Text>
          </Pressable>
          <Text
            color={theme.colors.primaryBlue}
            size={theme.fontSizes.md + 2}
            fontFamily="bold"
          >{`$${contracting.base_price}`}</Text>
        </View>
        {contracting.is_closed ? (
          <View style={styles.closedBadge}>
            <Text color={theme.colors.textOnBrand} fontFamily="bold">
              Completada
            </Text>
          </View>
        ) : null}
        <View style={{ padding: theme.spacing.sm, gap: 5 }}>
          <Text size={theme.fontSizes.lg} color={colors.text} fontFamily="bold">
            Descripción
          </Text>
          <Text size={theme.fontSizes.lg} color={colors.lightGray}>
            {contracting.description}
          </Text>
        </View>
        <Button
          title={buttonTitle}
          onPress={applyOrGotoMessage}
          disabled={contracting.is_closed || (!activeRequest && !canApply)}
        />
        <Divider />
      </View>
      <SlideModal visible={requestVisible} onClose={closeRequestModal}>
        <RequestForm
          contracting={contracting}
          defaultPrice={contracting.base_price.toString()}
          onSuccess={(newRequest) => {
            if (newRequest) {
              setActiveRequest(newRequest);
            }
            closeRequestModal();
            queryClient.invalidateQueries({
              queryKey: serviceRequestsKeys.byContractingAndProvider(
                contracting.id,
                user.id
              ),
            });
            queryClient.invalidateQueries({
              queryKey: serviceRequestsKeys.allForUser(user.id),
            });
            queryClient.invalidateQueries({
              queryKey: contractingsKeys.byCategory(contracting.category, user.id),
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
  closedBadge: {
    alignSelf: "flex-start",
    backgroundColor: theme.colors.completePurple,
    borderRadius: theme.radii.pill,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    marginHorizontal: theme.spacing.sm,
  },
});
