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

type Props = {
  request: ServiceRequestWithRelations;
};

const STATUS_MAP = {
  NEGOTIATION: { label: "Negociación", color: theme.colors.secondaryBlue },
  ACCEPTED: { label: "Aceptado", color: theme.colors.successGreen },
  CANCELED: { label: "Cancelado", color: theme.colors.redError },
  FINISHED: { label: "Finalizado", color: theme.colors.completePurple },
};

export default function RequestCard({ request }: Props) {
  const { colors } = useColorScheme();
  const navigation = useNavigation();
  const { user } = useAuthCtx();

  const service = request.service_detail;
  const provider = service?.provider_profile || ({} as any);
  const client = request.client_profile || ({} as any);

  const statusData = STATUS_MAP[request.agreement_state] || {
    label: "Pendiente",
    color: colors.lightGray,
  };

  const handlePress = () => {
    navigation.navigate("Main", {
      screen: "Chatroom",
      params: { request },
    });
  };

  return (
    <Pressable
      onPress={handlePress}
      style={{ ...styles.card, backgroundColor: colors.darkerGray }}
    >
      <StorageImage
        bucket="service-photos"
        path={service?.photos?.[0]}
        fallbackUri="https://via.placeholder.com/100x100"
        style={styles.image}
      />
      <View style={styles.info}>
        <View style={styles.rowSpace}>
          <Text numberOfLines={2} color={colors.text} style={styles.title}>
            {service.name}
          </Text>
          <Text style={[styles.status, { color: statusData.color }]}>
            {statusData.label}
          </Text>
        </View>

        <View style={styles.row}>
          <Feather name="user" size={14} color={colors.lightGray} />
          <Text style={[styles.sub, { color: colors.lightGray }]}>
            {user.id === client?.id ? provider.name : client.name}
          </Text>
        </View>

        <View style={styles.rowSpace}>
          <Text style={styles.label}>Propuesta:</Text>
          <Text style={styles.price}>{`$${request.agreed_price}`}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    flexDirection: "row",
    gap: 12,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: "#333",
  },
  info: {
    flex: 1,
    justifyContent: "space-between",
  },
  title: {
    fontSize: theme.fontSizes.md,
    fontFamily: theme.fontFamily.bold,
    flex: 1,
  },
  status: {
    fontFamily: theme.fontFamily.bold,
    fontSize: theme.fontSizes.sm,
    textTransform: "capitalize",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  rowSpace: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
    gap: 11,
  },
  label: {
    color: "#aaa",
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fontFamily.bold,
  },
  sub: {
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fontFamily.regular,
  },
  price: {
    color: theme.colors.primaryBlue,
    fontFamily: theme.fontFamily.bold,
  },
  agreedBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: theme.spacing.sm,
    backgroundColor: "#00B86B22",
    padding: 8,
    borderRadius: 8,
  },
  agreedText: {
    color: theme.colors.successGreen,
    fontFamily: theme.fontFamily.bold,
    fontSize: theme.fontSizes.sm,
  },
});
