import { StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ServiceRequest } from "@/models/ServiceRequest";
import { User } from "@/models/User";
import { radius, ThemeColors } from "@/theme/theme";
import { formatPrice } from "@/utils/format";
import { useAuthCtx } from "@/context/Auth";
import { useNegotiationCtx } from "@/context/Negotiation";
import { useAlertCtx } from "@/context/Alert";
import * as NS from "@/utils/negotiation";
import Text from "./ui/Text";
import Avatar from "./ui/Avatar";
import Button from "./ui/Button";
import StatusPill from "./ui/StatusPill";
import { useOffline } from "@/context/Offline";
import {
  getRemoteServiceRequestById,
  serviceRequestsKeys,
} from "@/api/serviceRequests";
import useSubscription from "@/hooks/useSubscription";
import useRequestStatus from "@/hooks/useRequestStatus";
import useTheme from "@/hooks/useTheme";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

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
  const { colors } = useTheme();
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
  const displayState: ServiceRequest["agreement_state"] =
    NS.isFinished(request) || NS.bothMarkedCompleted(request)
      ? "FINISHED"
      : NS.isCanceled(request) || NS.bothRejected(request)
        ? "CANCELED"
        : NS.isAccepted(request) || NS.bothAgreed(request)
          ? "ACCEPTED"
          : request.agreement_state;
  const lastOfferByClient = lastOfferUserId === client.id;

  const confirmAccept = () =>
    show({
      title: "¿Aceptar la propuesta?",
      message: `${formatPrice(request.agreed_price)} para el ${formatShortDate(request.agreed_date)}. El trato se cierra cuando ambos acepten.`,
      icon: "check-circle",
      iconColor: colors.success,
      onConfirm: statusModifier.setUserToAgreed,
    });
  const confirmReject = () =>
    show({
      title: "¿Rechazar la propuesta?",
      message: "La otra persona podrá enviarte una nueva oferta.",
      icon: "close-circle",
      iconColor: colors.danger,
      onConfirm: statusModifier.setUserToRejected,
    });
  const confirmComplete = () =>
    show({
      title: "¿Marcar como completado?",
      message: "Confirma que el trabajo se realizó. Se cierra cuando ambos lo marquen.",
      icon: "check-decagram",
      iconColor: colors.done,
      onConfirm: statusModifier.setUserToCompleted,
    });

  return (
    <View style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.line }]}>
      <View style={styles.topRow}>
        <View style={styles.flex}>
          <Text variant="caption" tone="subtle">
            {isRefreshingRequest ? "Actualizando propuesta…" : "Propuesta actual"}
          </Text>
          <View style={styles.priceRow}>
            <Text variant="display">{formatPrice(request.agreed_price)}</Text>
            <View style={styles.date}>
              <Feather name="calendar" size={14} color={colors.textMuted} />
              <Text variant="label" tone="muted">
                {formatShortDate(request.agreed_date)}
              </Text>
            </View>
          </View>
        </View>
        <StatusPill state={displayState} />
      </View>

      <View style={styles.parties}>
        <Party
          user={client}
          isMe={authUser.id === client.id}
          status={partyStatus(request, "client", colors)}
          lastOffer={lastOfferByClient}
        />
        <Feather
          name={lastOfferByClient ? "arrow-right" : "arrow-left"}
          size={16}
          color={colors.textSubtle}
          accessibilityLabel={`${lastOfferByClient ? client.name : provider.name} hizo la última oferta`}
        />
        <Party
          user={provider}
          isMe={authUser.id === provider.id}
          status={partyStatus(request, "provider", colors)}
          lastOffer={!lastOfferByClient}
          alignEnd
        />
      </View>

      <View style={styles.actions}>
        {showingCompletedBtn ? (
          <>
            <Button
              title="Completar"
              size="md"
              icon="check"
              style={styles.flex}
              disabled={completedBtnDisabled}
              onPress={confirmComplete}
            />
            <Button
              title="Valorar"
              size="md"
              icon="star"
              variant="secondary"
              style={styles.flex}
              disabled={reviewBtnDisabled}
              onPress={openReviewFn}
            />
          </>
        ) : (
          <>
            <Button
              title="Rechazar"
              size="md"
              variant="danger"
              style={styles.flex}
              disabled={statusBtnDisabled}
              onPress={confirmReject}
            />
            <Button
              title="Ofertar"
              size="md"
              variant="secondary"
              style={styles.flex}
              disabled={offerBtnDisabled}
              onPress={openOfferFn}
            />
            <Button
              title="Aceptar"
              size="md"
              style={styles.flex}
              disabled={statusBtnDisabled}
              onPress={confirmAccept}
            />
          </>
        )}
      </View>
    </View>
  );
}

type PartyStatus = { label: string; color: string };

function partyStatus(
  request: ServiceRequest,
  side: "client" | "provider",
  colors: ThemeColors,
): PartyStatus {
  const isClient = side === "client";
  if (isClient ? NS.clientMarkedCompleted(request) : NS.providerMarkedCompleted(request)) {
    return { label: "Completó", color: colors.done };
  }
  if (isClient ? NS.clientAgreed(request) : NS.providerAgreed(request)) {
    return { label: "Aceptó", color: colors.success };
  }
  if (isClient ? NS.clientRejected(request) : NS.providerRejected(request)) {
    return { label: "Rechazó", color: colors.danger };
  }
  return { label: "Pendiente", color: colors.accentText };
}

function Party({
  user,
  isMe,
  status,
  lastOffer,
  alignEnd,
}: {
  user: User;
  isMe: boolean;
  status: PartyStatus;
  lastOffer: boolean;
  alignEnd?: boolean;
}) {
  const avatar = (
    <View style={[styles.avatarRing, { borderColor: status.color }]}>
      <Avatar name={user.name} path={user.avatar} size={28} />
    </View>
  );
  return (
    <View style={[styles.party, alignEnd && styles.partyEnd]}>
      {!alignEnd && avatar}
      <View style={alignEnd ? styles.partyTextEnd : undefined}>
        <Text variant="caption" bold numberOfLines={1}>
          {isMe ? "Tú" : user.name?.split(" ")[0] ?? "—"}
        </Text>
        <Text variant="caption" color={status.color}>
          {lastOffer && status.label === "Pendiente" ? "Ofertó" : status.label}
        </Text>
      </View>
      {alignEnd && avatar}
    </View>
  );
}

const shortDate = new Intl.DateTimeFormat("es-MX", {
  weekday: "short",
  day: "numeric",
  month: "short",
});

function formatShortDate(date: string) {
  const value = new Date(date);
  return Number.isNaN(value.getTime()) ? "Sin fecha" : shortDate.format(value);
}

const styles = StyleSheet.create({
  panel: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 26,
    borderWidth: 1,
    gap: 14,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  flex: {
    flex: 1,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 10,
    flexWrap: "wrap",
  },
  date: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  parties: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  party: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  partyEnd: {
    justifyContent: "flex-end",
  },
  partyTextEnd: {
    alignItems: "flex-end",
  },
  avatarRing: {
    padding: 2,
    borderWidth: 2,
    borderRadius: radius.pill,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
});
