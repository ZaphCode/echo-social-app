import { memo } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { ServiceRequestWithRelations } from "@/api/types";
import useTheme from "@/hooks/useTheme";
import useAppNavigation from "@/navigation/useAppNavigation";
import { fonts, radius } from "@/theme/theme";
import { formatPrice, formatRelativeShort } from "@/utils/format";
import { getRequestProvider, getRequestSubject } from "@/utils/negotiationSubject";
import StatusPill from "./ui/StatusPill";
import StorageImage from "./ui/StorageImage";
import Text from "./ui/Text";

type Props = {
  request: ServiceRequestWithRelations;
  authUserId: string;
  unreadCount?: number;
};

function RequestCard({ request, authUserId, unreadCount = 0 }: Props) {
  const { colors } = useTheme();
  const nav = useAppNavigation();
  const subject = getRequestSubject(request);
  const provider = getRequestProvider(request);
  const isClient = authUserId === request.client;
  const counterpart = isClient ? provider?.name : request.client_profile?.name;
  const role = subject.type === "contracting" ? "Contratación" : "Servicio";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${subject.name}, ${unreadCount > 0 ? `${unreadCount} mensajes sin leer` : "abrir chat"}`}
      onPress={() => nav.chat(request)}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.line, opacity: pressed ? 0.85 : 1 },
      ]}
    >
      <StorageImage bucket="service-photos" path={subject.photos?.[0]} style={styles.image} />
      <View style={styles.info}>
        <View style={styles.titleRow}>
          <Text bold numberOfLines={1} style={styles.flex}>
            {subject.name}
          </Text>
          <Text variant="caption" tone="subtle">
            {formatRelativeShort(request.updated_at ?? request.requested)}
          </Text>
        </View>
        <Text variant="label" tone="muted" numberOfLines={1}>
          {`${role} · con ${counterpart || "otra persona"}`}
        </Text>
        <View style={styles.bottomRow}>
          <StatusPill state={request.agreement_state} />
          <View style={styles.priceRow}>
            <Text bold>{formatPrice(request.agreed_price)}</Text>
            {unreadCount > 0 && (
              <View style={[styles.unread, { backgroundColor: colors.accent }]}>
                <Text color={colors.onAccent} style={styles.unreadText}>
                  {unreadCount > 99 ? "99+" : String(unreadCount)}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export default memo(RequestCard);

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    gap: 12,
    padding: 12,
    borderRadius: radius.card,
    borderWidth: 1,
  },
  image: {
    width: 76,
    height: 76,
    borderRadius: 16,
  },
  info: {
    flex: 1,
    minWidth: 0,
    gap: 3,
    justifyContent: "center",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  flex: {
    flex: 1,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  unread: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 6,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  unreadText: {
    fontFamily: fonts.bold,
    fontSize: 11,
    lineHeight: 13,
  },
});
