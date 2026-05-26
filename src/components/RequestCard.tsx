import { View, StyleSheet, Pressable } from "react-native";
import React from "react";
import { ServiceRequestWithRelations } from "@/api/types";
import Text from "./ui/Text";
import { theme } from "@/theme/theme";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAuthCtx } from "@/context/Auth";
import useColorScheme from "@/hooks/useColorScheme";
import StorageImage from "./ui/StorageImage";
import { getRequestProvider, getRequestSubject } from "@/utils/negotiationSubject";

type Props = {
  request: ServiceRequestWithRelations;
  unreadCount?: number;
};

const STATUS_MAP = {
  NEGOTIATION: {
    label: "Negociación",
    color: theme.colors.primaryBlue,
    backgroundColor: "rgba(99, 195, 255, 0.12)",
    borderColor: "rgba(99, 195, 255, 0.28)",
  },
  ACCEPTED: {
    label: "Aceptado",
    color: theme.colors.successGreen,
    backgroundColor: "rgba(0, 184, 107, 0.12)",
    borderColor: "rgba(0, 184, 107, 0.28)",
  },
  CANCELED: {
    label: "Cancelado",
    color: theme.colors.redError,
    backgroundColor: "rgba(255, 105, 89, 0.12)",
    borderColor: "rgba(255, 105, 89, 0.28)",
  },
  FINISHED: {
    label: "Finalizado",
    color: theme.colors.completePurple,
    backgroundColor: "rgba(164, 94, 229, 0.12)",
    borderColor: "rgba(164, 94, 229, 0.28)",
  },
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function RequestCard({ request, unreadCount = 0 }: Props) {
  const { colors } = useColorScheme();
  const navigation = useNavigation();
  const { user } = useAuthCtx();

  const subject = getRequestSubject(request);
  const provider = getRequestProvider(request);
  const client = request.client_profile || ({} as any);

  const statusData = STATUS_MAP[request.agreement_state] || {
    label: "Pendiente",
    color: colors.lightGray,
    backgroundColor: "transparent",
    borderColor: colors.border,
  };

  const otherUserName = user.id === client?.id ? provider.name : client.name;

  const handlePress = () => {
    navigation.navigate("Main", {
      screen: "Chatroom",
      params: { request },
    });
  };

  return (
    <Pressable
      onPress={handlePress}
      style={[
        styles.card,
        {
          backgroundColor: colors.darkGray,
          borderColor: colors.darkerGray,
          borderLeftColor: statusData.color,
        },
      ]}
    >
      <StorageImage
        bucket="service-photos"
        path={subject.photos?.[0]}
        fallbackUri="https://via.placeholder.com/100x100"
        style={styles.image}
      />
      <View style={styles.info}>
        <View style={styles.topSection}>
          <Text numberOfLines={2} color={colors.text} style={styles.title}>
            {subject.name}
          </Text>

          <View style={styles.metaRow}>
            <View style={styles.userRow}>
              <Feather name="user" size={13} color={colors.lightGray} />
              <Text
                numberOfLines={1}
                style={[styles.sub, { color: colors.lightGray }]}
              >
                {otherUserName}
              </Text>
            </View>
            <View style={styles.statusAndUnread}>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: statusData.backgroundColor,
                    borderColor: statusData.borderColor,
                  },
                ]}
              >
                <Text style={[styles.status, { color: statusData.color }]}>
                  {statusData.label}
                </Text>
              </View>
              {unreadCount > 0 ? (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadBadgeText}>
                    {unreadCount > 99 ? "99+" : String(unreadCount)}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>

        <View style={[styles.bottomSection, { borderTopColor: colors.border }]}>
          <View style={styles.priceRow}>
            <Text style={[styles.label, { color: colors.lightGray }]}>
              Propuesta:
            </Text>
          </View>
          <View style={styles.priceGroup}>
            <Text style={styles.price}>
              {formatPrice(request.agreed_price)}
            </Text>
            <Text style={[styles.currency, { color: colors.lightGray }]}>
              USD
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderLeftWidth: 5,
    borderRadius: 16,
    padding: 14,
    marginBottom: theme.spacing.md,
    flexDirection: "row",
    gap: 12,
  },
  image: {
    width: 96,
    height: 96,
    borderRadius: 14,
    backgroundColor: "#333",
  },
  info: {
    flex: 1,
    minHeight: 96,
    justifyContent: "space-between",
  },
  topSection: {
    gap: 7,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  title: {
    fontSize: theme.fontSizes.md + 2,
    fontFamily: theme.fontFamily.bold,
    lineHeight: 23,
  },
  status: {
    fontFamily: theme.fontFamily.bold,
    fontSize: 10,
  },
  statusBadge: {
    minHeight: 28,
    paddingHorizontal: 10,
    borderRadius: theme.radii.pill,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
    minWidth: 0,
  },
  statusAndUnread: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 0,
  },
  label: {
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fontFamily.bold,
  },
  sub: {
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fontFamily.regular,
    flex: 1,
  },
  price: {
    color: theme.colors.primaryBlue,
    fontFamily: theme.fontFamily.bold,
    fontSize: 22,
  },
  currency: {
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fontFamily.bold,
    marginBottom: 2,
  },
  bottomSection: {
    borderTopWidth: 1,
    marginTop: 10,
    paddingTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  priceRow: {
    flex: 1,
    justifyContent: "center",
  },
  priceGroup: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
  },
  unreadBadge: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 6,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primaryBlue,
  },
  unreadBadgeText: {
    color: "white",
    fontFamily: theme.fontFamily.bold,
    fontSize: 12,
  },
});
