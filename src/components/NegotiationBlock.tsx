import { View, StyleSheet, Pressable } from "react-native";
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
import useRequestStatus from "@/hooks/useRequestStatus";
import useColorScheme from "@/hooks/useColorScheme";

const PERSON_ICON_SIZE = 38;

type Props = {
  openOfferFn: () => void;
  openReviewFn: () => void;
  hasReviewed: boolean;
};

export default function NegotiationBlock({
  openOfferFn,
  openReviewFn,
  hasReviewed,
}: Props) {
  const { user: authUser } = useAuthCtx();
  const { show } = useAlertCtx();
  const { request, client, provider, setRequest } = useNegotiationCtx();
  const statusModifier = useRequestStatus(authUser);
  const { colors } = useColorScheme();

  useSubscription("service_request", request.id, async ({ action, record }) => {
    if (action === "update") {
      setRequest(record);
    }
  });

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

  const offerBtnDisabled =
    authUser.id === lastOfferUserId || !NS.isNegotiation(request);

  const showingCompletedBtn =
    NS.bothAgreed(request) ||
    NS.isAccepted(request) ||
    (authUser.id === client.id && NS.clientMarkedCompleted(request)) ||
    (authUser.id === provider.id && NS.providerMarkedCompleted(request));

  const reviewBtnDisabled = !NS.isFinished(request) || hasReviewed;

  return (
    <View
      style={{ padding: theme.spacing.md, backgroundColor: colors.darkerGray }}
    >
      <View style={styles.agreementsDataContainer}>
        <View style={styles.userContainer}>
          {authUser.id === client.id && (
            <Text
              color={colors.primaryBlue}
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
                color={colors.primaryBlue}
              >{`$${request.agreed_price}`}</Text>
            </View>
            <View style={{ flexDirection: "row" }}>
              <Text>Fecha: </Text>
              <Text color={colors.primaryBlue}>
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
              color={colors.primaryBlue}
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
          <>
            <Pressable
              onPress={() =>
                show({
                  title: "Marcar como Completado",
                  message:
                    "¿Estás seguro de marcar esta solicitud como completada?",
                  icon: "check-circle",
                  iconColor: colors.completePurple,
                  onConfirm: statusModifier.setUserToCompleted,
                })
              }
              style={[
                styles.button,
                { opacity: completedBtnDisabled ? 0.25 : 1 },
              ]}
              disabled={completedBtnDisabled}
            >
              <Text color={colors.completePurple}>Marcar como completado</Text>
            </Pressable>
            <Pressable
              onPress={openReviewFn}
              style={[styles.button, { opacity: reviewBtnDisabled ? 0.25 : 1 }]}
              disabled={reviewBtnDisabled}
            >
              <Text color={"white"}>Valorar</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Pressable
              onPress={() =>
                show({
                  title: "Aceptar Propuesta",
                  message: "¿Estás seguro de aceptar esta propuesta?",
                  icon: "check-circle",
                  iconColor: colors.successGreen,
                  onConfirm: statusModifier.setUserToAgreed,
                })
              }
              style={[styles.button, { opacity: statusBtnDisabled ? 0.25 : 1 }]}
              disabled={statusBtnDisabled}
            >
              <Text color={colors.successGreen}>Aceptar</Text>
            </Pressable>
            <Pressable
              onPress={openOfferFn}
              disabled={offerBtnDisabled}
              style={[styles.button, { opacity: offerBtnDisabled ? 0.25 : 1 }]}
            >
              <Text color={colors.primaryBlue}>Ofertar</Text>
            </Pressable>
            <Pressable
              disabled={statusBtnDisabled}
              onPress={() =>
                show({
                  title: "Rechazar Propuesta",
                  message: "¿Estás seguro de rechazar esta propuesta?",
                  icon: "close-circle",
                  iconColor: colors.redError,
                  onConfirm: statusModifier.setUserToRejected,
                })
              }
              style={[
                styles.button,
                {
                  backgroundColor: colors.darkGray,
                  opacity: statusBtnDisabled ? 0.25 : 1,
                },
              ]}
            >
              <Text color={colors.redError}>Rechazar</Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs - 2,
    minWidth: 100,
    borderRadius: 8,
    alignItems: "center",
  },

  userContainer: { alignItems: "center", flexDirection: "row", marginTop: 20 },
});

function getClientColor(request: ServiceRequest) {
  const { colors } = useColorScheme();
  if (NS.clientAgreed(request)) {
    return colors.successGreen;
  } else if (NS.clientRejected(request)) {
    return colors.redError;
  } else if (NS.clientMarkedCompleted(request)) {
    return colors.completePurple;
  }
  return colors.primaryBlue;
}

function getProviderColor(request: ServiceRequest) {
  const { colors } = useColorScheme();
  if (NS.providerAgreed(request)) {
    return colors.successGreen;
  } else if (NS.providerRejected(request)) {
    return colors.redError;
  } else if (NS.providerMarkedCompleted(request)) {
    return colors.completePurple;
  }
  return colors.primaryBlue;
}
