import { View, StyleSheet, Image, Pressable } from "react-native";
import React from "react";
import { ServiceRequest } from "@/models/ServiceRequest";
import Text from "./ui/Text";
import { theme } from "@/theme/theme";
import { Feather } from "@expo/vector-icons";
import { getFileUrl } from "@/utils/format";
import { useNavigation } from "@react-navigation/native";
import { useAuthCtx } from "@/context/Auth";
import { clientAgreed, providerAgreed } from "@/utils/negotiation";

type Props = {
  request: ServiceRequest;
};

const STATUS_MAP = {
  NEGOTIATION: { label: "Negociación", color: theme.colors.secondaryBlue },
  ACCEPTED: { label: "Aceptado", color: theme.colors.successGreen },
  CANCELED: { label: "Cancelado", color: theme.colors.redError },
  FINISHED: { label: "Finalizado", color: theme.colors.completePurple },
};

export default function RequestCard({ request }: Props) {
  const navigation = useNavigation();
  const { user } = useAuthCtx();

  const service = request.expand!.service;
  const provider = service!.expand!.provider;
  const client = request.expand!.client;

  const imageUrl = service!.photos?.[0]
    ? getFileUrl("service", service.id, service.photos[0])
    : "https://via.placeholder.com/100x100";

  const statusData = STATUS_MAP[request.agreement_state] || {
    label: "Pendiente",
    color: theme.colors.lightGray,
  };

  const handlePress = () => {
    navigation.navigate("Main", {
      screen: "Chatroom",
      params: { request },
    });
  };

  return (
    <Pressable onPress={handlePress} style={styles.card}>
      <Image source={{ uri: imageUrl }} style={styles.image} />
      <View style={styles.info}>
        <View style={styles.rowSpace}>
          <Text numberOfLines={2} style={styles.title}>
            {service.name}
          </Text>
          <Text style={[styles.status, { color: statusData.color }]}>
            {statusData.label}
          </Text>
        </View>

        <View style={styles.row}>
          <Feather name="user" size={14} color={theme.colors.lightGray} />
          <Text style={styles.sub}>
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
    backgroundColor: theme.colors.darkerGray,
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
    color: "white",
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
    color: theme.colors.lightGray,
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
