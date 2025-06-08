import { View, StyleSheet, Pressable, Alert } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import { theme } from "@/theme/theme";
import { formatDate } from "@/utils/format";
import { useAuthCtx } from "@/context/Auth";
import { ServiceRequest } from "@/models/ServiceRequest";
import { useNegotiationCtx } from "@/context/Negotiation";
import { useAlertCtx } from "@/context/Alert";
import * as NS from "@/utils/negotiation";
import Text from "./ui/Text";
import useSubscription from "@/hooks/useSubscription";
import useMutate from "@/hooks/useMutate";

const PERSON_ICON_SIZE = 38;

type Props = {
  openModalFn?: () => void;
};

export default function NegotiationBlock({ openModalFn }: Props) {
  const { user: authUser } = useAuthCtx();
  const { show } = useAlertCtx();
  const { request, client, provider, setRequest } = useNegotiationCtx();

  const { update, mutationState } = useMutate("service_request", {
    expand: "service.provider",
  });

  useSubscription("service_request", request.id, async ({ action, record }) => {
    if (action === "update") {
      setRequest(record);
    }
  });

  const handleAccept = async () => {
    if (authUser.role === "client") {
      if (NS.providerAgreed(request)) {
        await update(request.id, {
          client_offer_status: "ACCEPTED",
          agreement_state: "ACCEPTED",
        });
      } else {
        await update(request.id, { client_offer_status: "ACCEPTED" });
      }
    } else {
      if (NS.clientAgreed(request)) {
        await update(request.id, {
          provider_offer_status: "ACCEPTED",
          agreement_state: "ACCEPTED",
        });
      } else {
        await update(request.id, { provider_offer_status: "ACCEPTED" });
      }
    }

    if (mutationState.status === "error") {
      return Alert.alert(
        "Error",
        "No se pudo crear la solicitud. Intente nuevamente."
      );
    }
  };

  const handleReject = async () => {
    if (authUser.role === "client") {
      if (NS.providerRejected(request)) {
        await update(request.id, {
          client_offer_status: "REJECTED",
          agreement_state: "CANCELED",
        });
      } else {
        await update(request.id, { client_offer_status: "REJECTED" });
      }
    } else {
      if (NS.clientRejected(request)) {
        await update(request.id, {
          provider_offer_status: "REJECTED",
          agreement_state: "CANCELED",
        });
      } else {
        await update(request.id, { provider_offer_status: "REJECTED" });
      }
    }

    if (mutationState.status === "error") {
      return Alert.alert(
        "Error",
        "No se pudo rechazar la oferta. Intente nuevamente."
      );
    }
  };

  const handleCompleted = async () => {
    if (authUser.role === "client") {
      if (NS.providerMarkedCompleted(request)) {
        await update(request.id, {
          client_offer_status: "COMPLETED",
          agreement_state: "FINISHED",
        });
      } else {
        await update(request.id, { client_offer_status: "COMPLETED" });
      }
    } else {
      if (NS.clientMarkedCompleted(request)) {
        await update(request.id, {
          provider_offer_status: "COMPLETED",
          agreement_state: "FINISHED",
        });
      } else {
        await update(request.id, { provider_offer_status: "COMPLETED" });
      }
    }

    if (mutationState.status === "error") {
      return Alert.alert(
        "Error",
        "No se pudo marcar la solicitud como completada. Intente nuevamente."
      );
    }
  };

  const lastOfferUserId = request.last_offer_user;

  const statusBtnDisabled =
    (authUser.id === client.id && NS.clientAgreed(request)) ||
    (authUser.id === provider.id && NS.providerAgreed(request)) ||
    (authUser.id === client.id && NS.clientRejected(request)) ||
    (authUser.id === provider.id && NS.providerRejected(request)) ||
    (authUser.id === client.id && NS.clientMarkedCompleted(request)) ||
    (authUser.id === provider.id && NS.providerMarkedCompleted(request)) ||
    NS.bothAgreed(request);

  const completedBtnDisabled =
    (authUser.id === client.id && NS.clientMarkedCompleted(request)) ||
    (authUser.id === provider.id && NS.providerMarkedCompleted(request));

  const offerBtnDisabled = authUser.id === lastOfferUserId || !NS.isNegotiation;

  const showingCompletedBtn =
    NS.bothAgreed(request) ||
    NS.isAccepted(request) ||
    (authUser.id === client.id && NS.clientMarkedCompleted(request)) ||
    (authUser.id === provider.id && NS.providerMarkedCompleted(request));

  return (
    <View style={styles.container}>
      <View style={styles.agreementsDataContainer}>
        <View style={styles.userContainer}>
          {authUser.id === client.id && (
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
            color={getClientColor(request)}
          />
          {lastOfferUserId === client.id && (
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
              >{`$${request.agreed_price}`}</Text>
            </View>
            <View style={{ flexDirection: "row" }}>
              <Text>Fecha: </Text>
              <Text color={theme.colors.primaryBlue}>
                {formatDate(request.agreed_date)}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.userContainer}>
          {lastOfferUserId === provider.id && (
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
            color={getProviderColor(request)}
          />
          {authUser.id === provider.id && (
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
        {showingCompletedBtn ? (
          <Pressable
            onPress={() =>
              show({
                title: "Marcar como Completado",
                message:
                  "¿Estás seguro de marcar esta solicitud como completada?",
                icon: "check-circle",
                iconColor: theme.colors.completePurple,
                onConfirm: handleCompleted,
              })
            }
            style={[
              styles.button,
              { opacity: completedBtnDisabled ? 0.25 : 1 },
            ]}
            disabled={completedBtnDisabled}
          >
            <Text color={theme.colors.completePurple}>
              Marcar como completado
            </Text>
          </Pressable>
        ) : (
          <>
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
          </>
        )}
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
  } else if (NS.clientMarkedCompleted(request)) {
    return theme.colors.completePurple;
  }
  return theme.colors.primaryBlue;
}

function getProviderColor(request: ServiceRequest) {
  if (NS.providerAgreed(request)) {
    return theme.colors.successGreen;
  } else if (NS.providerRejected(request)) {
    return theme.colors.redError;
  } else if (NS.providerMarkedCompleted(request)) {
    return theme.colors.completePurple;
  }
  return theme.colors.primaryBlue;
}
