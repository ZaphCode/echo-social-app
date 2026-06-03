import { View, StyleSheet, Pressable } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import { ServiceRequest } from "@/models/ServiceRequest";
import { theme } from "@/theme/theme";
import { formatDate } from "@/utils/format";
import { useAuthCtx } from "@/context/Auth";
import { useNegotiationCtx } from "@/context/Negotiation";
import { useAlertCtx } from "@/context/Alert";
import * as NS from "@/utils/negotiation";
import Text from "./ui/Text";
import { useOffline } from "@/context/Offline";
import {
  getRemoteServiceRequestById,
  serviceRequestsKeys,
} from "@/api/serviceRequests";
import useSubscription from "@/hooks/useSubscription";
import useRequestStatus from "@/hooks/useRequestStatus";
import useColorScheme from "@/hooks/useColorScheme";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

const PERSON_ICON_SIZE = 38;
const ACTION_ICON_SIZE = 15;
const ACTION_TEXT_SIZE = theme.fontSizes.sm - 1;
const REQUEST_REFRESH_TIMEOUT_MS = 15_000;

type Props = {
  openOfferFn: () => void;
  openReviewFn: () => void;
  hasReviewed: boolean;
  shouldNotifyCounterparty: boolean;
};

function withRequestRefreshTimeout<T>(promise: Promise<T>) {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error("Tiempo de espera agotado al actualizar la propuesta."));
      }, REQUEST_REFRESH_TIMEOUT_MS);
    }),
  ]);
}

export default function NegotiationBlock({
  openOfferFn,
  openReviewFn,
  hasReviewed,
  shouldNotifyCounterparty,
}: Props) {
  const { user: authUser } = useAuthCtx();
  const { show } = useAlertCtx();
  const { request, client, provider, subject, setRequest } = useNegotiationCtx();
  const { isOnline, isSyncing } = useOffline();
  const queryClient = useQueryClient();
  const statusModifier = useRequestStatus(authUser, {
    shouldNotifyCounterparty,
  });
  const { colors, activeMode } = useColorScheme();
  const [isRefreshingRequest, setIsRefreshingRequest] = useState(false);
  const hasBootstrappedRef = useRef(false);
  const wasOnlineRef = useRef(isOnline);
  const wasSyncingRef = useRef(isSyncing);

  useSubscription<ServiceRequest>(
    "service_request",
    request.id,
    async ({ action, record }) => {
      if (action === "UPDATE" && record.id === request.id) {
        const latestRequest = await withRequestRefreshTimeout(
          getRemoteServiceRequestById(record.id)
        );
        setRequest(latestRequest);
      }
    },
  );

  useEffect(() => {
    const becameOnline = !wasOnlineRef.current && isOnline;
    const finishedSyncing = wasSyncingRef.current && !isSyncing;
    wasOnlineRef.current = isOnline;
    wasSyncingRef.current = isSyncing;

    if (!isOnline) return;
    if (hasBootstrappedRef.current && !becameOnline && !finishedSyncing) return;

    let cancelled = false;

    const syncRequestState = async () => {
      setIsRefreshingRequest(true);

      try {
        const latestRequest = await withRequestRefreshTimeout(
          getRemoteServiceRequestById(request.id)
        );

        if (cancelled) return;

        setRequest(latestRequest);
        hasBootstrappedRef.current = true;

        await queryClient.invalidateQueries({
          queryKey: serviceRequestsKeys.detail(request.id),
        });
        await queryClient.invalidateQueries({
          queryKey: serviceRequestsKeys.allForUser(authUser.id),
        });
      } catch {
        // Keep the current request state until the next successful refresh.
      } finally {
        if (!cancelled) {
          setIsRefreshingRequest(false);
        }
      }
    };

    syncRequestState();

    return () => {
      cancelled = true;
    };
  }, [authUser.id, isOnline, isSyncing, queryClient, request.id, setRequest]);

  const lastOfferUserId = request.last_offer_user;
  const hasRejectedCurrentOffer =
    NS.clientRejected(request) || NS.providerRejected(request);

  const statusBtnDisabled =
    hasRejectedCurrentOffer ||
    (authUser.id === client.id && NS.clientAgreed(request)) ||
    (authUser.id === provider.id && NS.providerAgreed(request)) ||
    (authUser.id === client.id && NS.clientMarkedCompleted(request)) ||
    (authUser.id === provider.id && NS.providerMarkedCompleted(request)) ||
    NS.bothAgreed(request);

  const completedBtnDisabled =
    (authUser.id === client.id && NS.clientMarkedCompleted(request)) ||
    (authUser.id === provider.id && NS.providerMarkedCompleted(request));

  const offerBtnDisabled =
    !NS.isNegotiation(request) ||
    (!hasRejectedCurrentOffer && authUser.id === lastOfferUserId);

  const showingCompletedBtn =
    NS.bothAgreed(request) ||
    NS.isAccepted(request) ||
    (authUser.id === client.id && NS.clientMarkedCompleted(request)) ||
    (authUser.id === provider.id && NS.providerMarkedCompleted(request));

  const reviewBtnDisabled =
    !NS.isFinished(request) ||
    hasReviewed ||
    (subject.type === "contracting" && authUser.id !== client.id);
  const acceptButtonStyles = getButtonVariantStyles(
    "accept",
    colors,
    activeMode,
  );
  const offerButtonStyles = getButtonVariantStyles("offer", colors, activeMode);
  const rejectButtonStyles = getButtonVariantStyles(
    "reject",
    colors,
    activeMode,
  );
  const completeButtonStyles = getButtonVariantStyles(
    "complete",
    colors,
    activeMode,
  );
  const reviewButtonStyles = getButtonVariantStyles(
    "review",
    colors,
    activeMode,
  );

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
              color={colors.text}
              style={{ position: "absolute", left: 32 }}
            />
          )}
        </View>
        <View style={{ alignItems: "center" }}>
          <Text fontFamily="bold" color={colors.text}>
            Propuestas de Negociación
          </Text>
          <View style={{ justifyContent: "center" }}>
            {isRefreshingRequest ? (
              <Text color={colors.lightGray} size={theme.fontSizes.sm}>
                Actualizando estado...
              </Text>
            ) : null}
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
              color={colors.text}
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
                completeButtonStyles.button,
                { opacity: completedBtnDisabled ? 0.25 : 1 },
              ]}
              disabled={completedBtnDisabled}
            >
              <MaterialIcons
                name="task-alt"
                size={ACTION_ICON_SIZE}
                color={completeButtonStyles.text}
              />
              <Text
                fontFamily="bold"
                color={completeButtonStyles.text}
                size={ACTION_TEXT_SIZE}
              >
                Completar
              </Text>
            </Pressable>
            <Pressable
              onPress={openReviewFn}
              style={[
                styles.button,
                reviewButtonStyles.button,
                { opacity: reviewBtnDisabled ? 0.25 : 1 },
              ]}
              disabled={reviewBtnDisabled}
            >
              <MaterialIcons
                name="star-rate"
                size={ACTION_ICON_SIZE}
                color={reviewButtonStyles.text}
              />
              <Text
                fontFamily="bold"
                color={reviewButtonStyles.text}
                size={ACTION_TEXT_SIZE}
              >
                Valorar
              </Text>
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
              style={[
                styles.button,
                acceptButtonStyles.button,
                { opacity: statusBtnDisabled ? 0.25 : 1 },
              ]}
              disabled={statusBtnDisabled}
            >
              <MaterialIcons
                name="check-circle"
                size={ACTION_ICON_SIZE}
                color={acceptButtonStyles.text}
              />
              <Text
                fontFamily="bold"
                color={acceptButtonStyles.text}
                size={ACTION_TEXT_SIZE}
              >
                Aceptar
              </Text>
            </Pressable>
            <Pressable
              onPress={openOfferFn}
              disabled={offerBtnDisabled}
              style={[
                styles.button,
                offerButtonStyles.button,
                { opacity: offerBtnDisabled ? 0.25 : 1 },
              ]}
            >
              <MaterialIcons
                name="local-offer"
                size={ACTION_ICON_SIZE}
                color={offerButtonStyles.text}
              />
              <Text
                fontFamily="bold"
                color={offerButtonStyles.text}
                size={ACTION_TEXT_SIZE}
              >
                Ofertar
              </Text>
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
                rejectButtonStyles.button,
                { opacity: statusBtnDisabled ? 0.25 : 1 },
              ]}
            >
              <MaterialIcons
                name="cancel"
                size={ACTION_ICON_SIZE}
                color={rejectButtonStyles.text}
              />
              <Text
                fontFamily="bold"
                color={rejectButtonStyles.text}
                size={ACTION_TEXT_SIZE}
              >
                Rechazar
              </Text>
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
    gap: theme.spacing.sm,
  },
  button: {
    paddingHorizontal: theme.spacing.sm + 2,
    paddingVertical: theme.spacing.xs - 3,
    backgroundColor: "#5757575E",
    minWidth: 88,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: theme.spacing.xs - 4,
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

function getButtonVariantStyles(
  variant: "accept" | "offer" | "reject" | "complete" | "review",
  colors: ReturnType<typeof useColorScheme>["colors"],
  activeMode: ReturnType<typeof useColorScheme>["activeMode"],
) {
  const isLight = activeMode === "light";

  switch (variant) {
    case "accept":
      return {
        button: {
          backgroundColor: isLight
            ? colors.successGreen
            : "rgba(0, 184, 107, 0.18)",
          borderWidth: 1,
          borderColor: colors.successGreen,
        },
        text: isLight ? colors.textOnBrand : colors.successGreen,
      };
    case "offer":
      return {
        button: {
          backgroundColor: isLight
            ? colors.primaryBlue
            : "rgba(99, 195, 255, 0.18)",
          borderWidth: 1,
          borderColor: colors.primaryBlue,
        },
        text: isLight ? colors.textOnBrand : colors.primaryBlue,
      };
    case "reject":
      return {
        button: {
          backgroundColor: isLight
            ? colors.redError
            : "rgba(255, 105, 89, 0.18)",
          borderWidth: 1,
          borderColor: colors.redError,
        },
        text: isLight ? colors.textOnBrand : colors.redError,
      };
    case "complete":
      return {
        button: {
          backgroundColor: isLight
            ? colors.completePurple
            : "rgba(164, 94, 229, 0.18)",
          borderWidth: 1,
          borderColor: colors.completePurple,
        },
        text: isLight ? colors.textOnBrand : colors.completePurple,
      };
    case "review":
      return {
        button: {
          backgroundColor: isLight ? colors.secondaryBlue : colors.darkGray,
          borderWidth: 1,
          borderColor: isLight ? colors.secondaryBlue : colors.border,
        },
        text: isLight ? colors.textOnBrand : colors.text,
      };
  }
}
