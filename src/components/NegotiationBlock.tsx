import { View, StyleSheet, Pressable, Alert } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";

import { theme } from "@/theme/theme";
import { formatDate } from "@/utils/format";
import { useAuthCtx } from "@/context/Auth";
import { ServiceRequest } from "@/models/ServiceRequest";
import { bothAgreed, clientAgreed, providerAgreed } from "@/utils/negotiation";
import Text from "./ui/Text";
import useSubscription from "@/hooks/useSubscription";
import useMutate from "@/hooks/useMutate";
import AlertModal from "./ui/AlertModal";
import useModal from "@/hooks/useModal";

const PERSON_ICON_SIZE = 38;

type Props = {
  request: ServiceRequest;
  openModalFn?: () => void;
};

export default function NegotiationBlock({ request, openModalFn }: Props) {
  const { user: authUser } = useAuthCtx();
  const [visible, open, close] = useModal();

  const [currentRequestData, setCurrentRequestData] = useState(request);

  const { update, mutationState } = useMutate("service_request", {
    expand: "service",
  });

  useSubscription("service_request", request.id, ({ action, record }) => {
    if (action === "update") {
      setCurrentRequestData(record);
    }
  });

  const handleAccept = async () => {
    if (bothAgreed(currentRequestData)) return;

    if (authUser.role === "client") {
      await update(request.id, { client_offer_status: "ACCEPTED" });
    } else {
      await update(request.id, { provider_offer_status: "ACCEPTED" });
    }

    if (mutationState.status === "error") {
      return Alert.alert(
        "Error",
        "No se pudo crear la solicitud. Intente nuevamente."
      );
    }
  };

  const provider = request.expand?.service.provider;
  const client = request.client;
  const lastOfferUser = currentRequestData.last_offer_user;

  const acceptBtnDisabled =
    (authUser.id === client && clientAgreed(currentRequestData)) ||
    (authUser.id === provider && providerAgreed(currentRequestData));

  const offerBtnDisabled =
    authUser.id === lastOfferUser || bothAgreed(currentRequestData);

  const rejectBtnDisabled = bothAgreed(currentRequestData);

  return (
    <View style={styles.container}>
      <View style={styles.agreementsDataContainer}>
        <View style={styles.userContainer}>
          <MaterialIcons
            name="person"
            size={PERSON_ICON_SIZE}
            color={
              clientAgreed(currentRequestData)
                ? theme.colors.successGreen
                : theme.colors.primaryBlue
            }
          />
          {lastOfferUser === client && (
            <MaterialIcons
              name="arrow-right"
              size={32}
              color="white"
              style={{ position: "absolute", left: 32 }}
            />
          )}
        </View>
        <View style={{ alignItems: "center" }}>
          <Text fontFamily="bold" color="white">
            Propuestas de Negociación
          </Text>
          <View style={{ justifyContent: "center" }}>
            <View style={{ flexDirection: "row" }}>
              <Text>Precio: </Text>
              <Text
                color={theme.colors.primaryBlue}
              >{`$${currentRequestData.agreed_price}`}</Text>
            </View>
            <View style={{ flexDirection: "row" }}>
              <Text>Fecha: </Text>
              <Text color={theme.colors.primaryBlue}>
                {formatDate(currentRequestData.agreed_date)}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.userContainer}>
          {lastOfferUser === provider && (
            <MaterialIcons
              name="arrow-left"
              size={32}
              color="white"
              style={{ position: "absolute", right: 32 }}
            />
          )}
          <MaterialIcons
            name="person-4"
            size={PERSON_ICON_SIZE}
            color={
              providerAgreed(currentRequestData)
                ? theme.colors.successGreen
                : theme.colors.primaryBlue
            }
          />
        </View>
      </View>
      <View style={styles.buttonsContainer}>
        <Pressable
          onPress={handleAccept}
          style={[styles.button, { opacity: acceptBtnDisabled ? 0.25 : 1 }]}
          disabled={acceptBtnDisabled}
        >
          <Text color={theme.colors.successGreen}>Aceptar</Text>
        </Pressable>
        <Pressable
          onPress={openModalFn}
          disabled={offerBtnDisabled}
          style={[styles.button, { opacity: offerBtnDisabled ? 0.25 : 1 }]}
        >
          <Text color={theme.colors.primaryBlue}>Ofertar</Text>
        </Pressable>
        <Pressable
          disabled={rejectBtnDisabled}
          onPress={open}
          style={[styles.button, { opacity: rejectBtnDisabled ? 0.25 : 1 }]}
        >
          <Text color={theme.colors.redError}>Rechazar</Text>
        </Pressable>
      </View>
      <AlertModal visible={visible} onClose={close}>
        <Text>Hi</Text>
      </AlertModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.darkerGray,
    padding: theme.spacing.md,
  },
  agreementsDataContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  button: {
    backgroundColor: theme.colors.darkGray,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs - 2,
    minWidth: 100,
    borderRadius: 8,
    alignItems: "center",
  },

  userContainer: { alignItems: "center", flexDirection: "row", marginTop: 20 },
});
