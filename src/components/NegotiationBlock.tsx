import { View, StyleSheet, Pressable, Alert } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";

import { theme } from "@/theme/theme";
import { formatDate } from "@/utils/format";
import { useAuthCtx } from "@/context/Auth";
import { ServiceRequest } from "@/models/ServiceRequest";
import * as NS from "@/utils/negotiation";
import Text from "./ui/Text";
import useSubscription from "@/hooks/useSubscription";
import useMutate from "@/hooks/useMutate";
import { useAlertCtx } from "@/context/Alert";

const PERSON_ICON_SIZE = 38;

type Props = {
  request: ServiceRequest;
  openModalFn?: () => void;
};

export default function NegotiationBlock({ request, openModalFn }: Props) {
  const { user: authUser } = useAuthCtx();
  const { show } = useAlertCtx();

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
    if (NS.bothAgreed(currentRequestData)) return;

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

  const handleReject = async () => {
    if (NS.bothAgreed(currentRequestData)) return;

    if (authUser.role === "client") {
      await update(request.id, { client_offer_status: "REJECTED" });
    } else {
      await update(request.id, { provider_offer_status: "REJECTED" });
    }

    if (mutationState.status === "error") {
      return Alert.alert(
        "Error",
        "No se pudo rechazar la oferta. Intente nuevamente."
      );
    }
  };

  const provider = request.expand?.service.provider;
  const client = request.client;
  const lastOfferUser = currentRequestData.last_offer_user;

  const statusBtnDisabled =
    (authUser.id === client && NS.clientAgreed(currentRequestData)) ||
    (authUser.id === provider && NS.providerAgreed(currentRequestData)) ||
    (authUser.id === client && NS.clientRejected(currentRequestData)) ||
    (authUser.id === provider && NS.providerRejected(currentRequestData)) ||
    NS.bothAgreed(currentRequestData);

  const offerBtnDisabled =
    authUser.id === lastOfferUser ||
    !statusBtnDisabled ||
    NS.bothRejected(currentRequestData);

  return (
    <View style={styles.container}>
      <View style={styles.agreementsDataContainer}>
        <View style={styles.userContainer}>
          {authUser.id === client && (
            <Text
              color={theme.colors.primaryBlue}
              size={theme.fontSizes.sm + 1}
              style={{ position: "absolute", bottom: 40, left: 7 }}
            >
              (Tú)
            </Text>
          )}
          <MaterialIcons
            name="person"
            size={PERSON_ICON_SIZE}
            color={getClientColor(currentRequestData)}
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
            color={getProviderColor(currentRequestData)}
          />
          {authUser.id === provider && (
            <Text
              color={theme.colors.primaryBlue}
              size={theme.fontSizes.sm + 1}
              style={{ position: "absolute", bottom: 40, left: 7 }}
            >
              (Tú)
            </Text>
          )}
        </View>
      </View>
      <View style={styles.buttonsContainer}>
        <Pressable
          onPress={() =>
            show({
              title: "Aceptar Propuesta",
              message: "¿Estás seguro de aceptar esta propuesta?",
              icon: "check-circle",
              iconColor: theme.colors.successGreen,
              onConfirm: handleAccept,
            })
          }
          style={[styles.button, { opacity: statusBtnDisabled ? 0.25 : 1 }]}
          disabled={statusBtnDisabled}
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
          disabled={statusBtnDisabled}
          onPress={() =>
            show({
              title: "Rechazar Propuesta",
              message: "¿Estás seguro de rechazar esta propuesta?",
              icon: "close-circle",
              iconColor: theme.colors.redError,
              onConfirm: handleReject,
            })
          }
          style={[styles.button, { opacity: statusBtnDisabled ? 0.25 : 1 }]}
        >
          <Text color={theme.colors.redError}>Rechazar</Text>
        </Pressable>
      </View>
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

function getClientColor(request: ServiceRequest) {
  if (NS.clientAgreed(request)) {
    return theme.colors.successGreen;
  } else if (NS.clientRejected(request)) {
    return theme.colors.redError;
  }
  return theme.colors.primaryBlue;
}

function getProviderColor(request: ServiceRequest) {
  if (NS.providerAgreed(request)) {
    return theme.colors.successGreen;
  } else if (NS.providerRejected(request)) {
    return theme.colors.redError;
  }
  return theme.colors.primaryBlue;
}
