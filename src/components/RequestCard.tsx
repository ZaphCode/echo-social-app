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

export default function RequestCard({ request }: Props) {
  const navigation = useNavigation();
  const { user } = useAuthCtx();

  const status = request.agreement_state;

  const statusColors: Record<typeof status, string> = {
    PENDING: theme.colors.lightGray,
    ACCEPTED: theme.colors.primaryBlue,
    CANCELED: "#FF4C4C",
    FINISHED: "#2ECC71",
  };

  const service = request.expand!.service;
  const provider = service!.expand!.provider;
  const client = request.expand!.client;
  const imageUrl = service!.photos?.[0]
    ? getFileUrl("service", service.id, service.photos[0])
    : "https://via.placeholder.com/100x100";

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
          <Text style={styles.title}>{service?.name}</Text>
          <Text style={[styles.status, { color: statusColors[status] }]}>
            {status}
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

        {clientAgreed(request) && providerAgreed(request) && (
          <View style={styles.agreedBox}>
            <Feather name="check-circle" size={16} color="#2ECC71" />
            <Text style={styles.agreedText}>Ambas partes confirmaron</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.darkGray,
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
    color: "#fff",
    fontSize: theme.fontSizes.md,
    fontFamily: theme.fontFamily.bold,
    flex: 1,
  },
  status: {
    fontFamily: theme.fontFamily.bold,
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
    backgroundColor: "#2ECC7110",
    padding: 8,
    borderRadius: 8,
  },
  agreedText: {
    color: "#2ECC71",
    fontFamily: theme.fontFamily.bold,
    fontSize: theme.fontSizes.sm,
  },
});
