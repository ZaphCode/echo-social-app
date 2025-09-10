import { useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { useForm } from "react-hook-form";

import { theme } from "@/theme/theme";
import { useKeyboardVisible } from "@/hooks/useKeyboardVisible";
import { ServiceRequest } from "@/models/ServiceRequest";
import { Service } from "@/models/Service";
import { useAuthCtx } from "@/context/Auth";
import { validPriceRules } from "@/utils/validations";
import Field from "./Field";
import Text from "../ui/Text";
import Button from "../ui/Button";
import DateField from "./DateField";
import useMutate from "@/hooks/useMutate";
import { useAlertCtx } from "@/context/Alert";

const DEVICE_HEIGHT = Dimensions.get("window").height;

type Props = {
  service: Service;
  onSuccess: (request?: ServiceRequest) => void;
  requestId?: string;
  defaultPrice?: string;
  defaultDate?: string;
};

export default function RequestForm({
  service,
  requestId,
  onSuccess,
  defaultDate,
  defaultPrice,
}: Props) {
  const { user } = useAuthCtx();
  const { show } = useAlertCtx();
  const keyboardVisible = useKeyboardVisible();
  const [offsetHeight, setOffsetHeight] = useState(0);
  const offeringMode = !!requestId;

  const { control, handleSubmit } = useForm({
    defaultValues: {
      price: defaultPrice || "",
      date: defaultDate || "",
      notes: "",
    },
  });

  const requestMutation = useMutate("service_request", {
    expand: "service.provider, client",
  });

  const notificationMutation = useMutate("notification");

  const onSubmit = handleSubmit(async (data) => {
    if (offeringMode) {
      await requestMutation.update(requestId, {
        agreed_price: parseFloat(data.price),
        agreed_date: data.date,
        client_offer_status: "PENDING",
        provider_offer_status: "PENDING",
        last_offer_user: user.id,
      });

      if (requestMutation.mutationState.status === "error")
        return show({
          title: "Error al Ofertar",
          message: "No se pudo enviar tu oferta. Intente nuevamente.",
          icon: "alert-circle",
          iconColor: theme.colors.redError,
        });

      onSuccess();
    } else {
      const newRequest = await requestMutation.create({
        service: service.id,
        client: user.id,
        last_offer_user: user.id,
        agreed_price: parseFloat(data.price),
        agreed_date: data.date,
        notes: data.notes,
        agreement_state: "NEGOTIATION",
        client_offer_status: "PENDING",
        provider_offer_status: "PENDING",
      });

      if (requestMutation.mutationState.status === "error" || !newRequest) {
        return show({
          title: "Error al Solicitar Servicio",
          message: "No se pudo enviar tu solicitud. Intente nuevamente.",
          icon: "alert-circle",
          iconColor: theme.colors.redError,
        });
      }

      await notificationMutation.create({
        user: service.provider,
        message: `Nueva solicitud de servicio de *${user.name}* para *${service.name}*`,
        type: "PROVIDER:NEW_REQUEST",
        read: false,
      });

      console.log("New request created:", newRequest);

      onSuccess(newRequest);
    }
  });

  return (
    <View style={styles.container}>
      <Text color="white" fontFamily="bold" size={theme.fontSizes.xl}>
        {offeringMode ? "Realiza una oferta" : `Solicitud de Servicio`}
      </Text>
      <View style={{ width: "90%", gap: theme.spacing.md }}>
        <Field
          label={offeringMode ? "Precio" : "Oferta inicial"}
          placeholder={`${service.base_price}`}
          keyboardType="numeric"
          name="price"
          icon="dollar-sign"
          onFocus={() => setOffsetHeight(10)}
          control={control}
          rules={validPriceRules}
        />
        <DateField control={control} name="date" label="Fecha" />
        {!offeringMode && (
          <Field
            label="Notas (opcional)"
            placeholder="Especifique algo..."
            icon="edit"
            name="notes"
            onFocus={() => setOffsetHeight(DEVICE_HEIGHT * 0.25)}
            control={control}
            rules={{ required: false, validate: () => true }}
          />
        )}
        <View style={{ height: keyboardVisible ? offsetHeight : 0 }}></View>
        <Button
          loading={requestMutation.mutationState.status === "loading"}
          title="Enviar"
          onPress={onSubmit}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },
});
