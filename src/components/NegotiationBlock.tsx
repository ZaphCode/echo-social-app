import { View, StyleSheet, Pressable, Alert } from "react-native";
import React, { useState } from "react";
import { theme } from "@/theme/theme";
import Text from "./ui/Text";
import { MaterialIcons } from "@expo/vector-icons";
import useSubscription from "@/hooks/useSubscription";
import { ServiceRequest } from "@/models/ServiceRequest";
import { formatDate } from "@/utils/format";
import useMutate from "@/hooks/useMutate";
import { useAuthCtx } from "@/context/Auth";

const PERSON_ICON_SIZE = 38;

type Props = {
  request: ServiceRequest;
  openModalFn?: () => void;
};

export default function NegotiationBlock({ request, openModalFn }: Props) {
  const { user } = useAuthCtx();

  const [currentAgreement, setCurrentAgreement] = useState({
    price: request.agreed_price,
    date: formatDate(request.agreed_date),
    isClientAgreed: request.client_agrees,
    isProviderAgreed: request.provider_agrees,
  });

  const { update, mutationState } = useMutate("service_request");

  useSubscription("service_request", request.id, ({ action, record }) => {
    if (action === "update") {
      setCurrentAgreement({
        price: record.agreed_price,
        date: formatDate(record.agreed_date),
        isClientAgreed: record.client_agrees,
        isProviderAgreed: record.provider_agrees,
      });
    }
  });

  const handleAccept = async () => {
    if (currentAgreement.isClientAgreed && currentAgreement.isProviderAgreed) {
      return;
    }

    if (user.role === "client") {
      await update(request.id, {
        client_agrees: true,
      });
    } else {
      await update(request.id, {
        provider_agrees: true,
      });
    }

    if (mutationState.status === "error") {
      return Alert.alert(
        "Error",
        "No se pudo crear la solicitud. Intente nuevamente."
      );
    }

    await update(request.id, {});
  };

  return (
    <View style={styles.container}>
      <View style={styles.agreementsDataContainer}>
        <View>
          <MaterialIcons
            name="person"
            size={PERSON_ICON_SIZE}
            color={
              currentAgreement.isClientAgreed
                ? "green"
                : theme.colors.primaryBlue
            }
          />
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
              >{`$${currentAgreement.price}`}</Text>
            </View>
            <View style={{ flexDirection: "row" }}>
              <Text>Fecha: </Text>
              <Text color={theme.colors.primaryBlue}>
                {currentAgreement.date}
              </Text>
            </View>
          </View>
        </View>
        <View>
          <MaterialIcons
            name="person-4"
            size={PERSON_ICON_SIZE}
            color={
              currentAgreement.isProviderAgreed
                ? "green"
                : theme.colors.primaryBlue
            }
          />
        </View>
      </View>
      <View style={styles.buttonsContainer}>
        <Pressable onPress={handleAccept} style={styles.button}>
          <Text>Aceptar</Text>
        </Pressable>
        <Pressable onPress={openModalFn} style={styles.button}>
          <Text>Ofertar</Text>
        </Pressable>
        <Pressable style={styles.button}>
          <Text>Rechazar</Text>
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
});
