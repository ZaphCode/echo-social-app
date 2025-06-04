import { useState } from "react";
import { Alert, Dimensions, StyleSheet, View } from "react-native";
import { useForm } from "react-hook-form";

import { theme } from "@/theme/theme";
import { useKeyboardVisible } from "@/hooks/useKeyboardVisible";
import { ServiceRequest } from "@/models/ServiceRequest";
import { Service } from "@/models/Service";
import { useAuthCtx } from "@/context/Auth";
import { validPriceRules } from "@/utils/validations";
import Field from "./ui/Field";
import Text from "./ui/Text";
import Button from "./ui/Button";
import DateField from "./ui/DateField";
import useMutate from "@/hooks/useMutate";

const DEVICE_HEIGHT = Dimensions.get("window").height;

type Props = {
  service: Service;
  onSuccess: (request?: ServiceRequest) => void;
  requestId?: string;
};

export default function RequestForm({ service, requestId, onSuccess }: Props) {
  const { user } = useAuthCtx();
  const keyboardVisible = useKeyboardVisible();
  const [offsetHeight, setOffsetHeight] = useState(0);
  const offeringMode = !!requestId;

  const { control, handleSubmit } = useForm({
    defaultValues: {
      price: "",
      date: "",
      notes: "",
    },
  });

  const { create, update, mutationState } = useMutate("service_request", {
    expand: "service.provider, client",
  });

  const onSubmit = handleSubmit(async (data) => {
    if (offeringMode) {
      await update(requestId, {
        agreed_price: parseFloat(data.price),
        agreed_date: data.date,
        client_offer_status: "PENDING",
        provider_offer_status: "PENDING",
      });

      if (mutationState.status === "error")
        return Alert.alert(
          "Error",
          "No se pudo crear la solicitud. Intente nuevamente."
        );

      onSuccess();
    } else {
      const newRequest = await create({
        service: service.id,
        client: user.id,
        agreed_price: parseFloat(data.price),
        agreed_date: data.date,
        notes: data.notes,
        request_state: "PENDING",
        client_offer_status: "PENDING",
        provider_offer_status: "PENDING",
      });

      if (mutationState.status === "error" || !newRequest)
        return Alert.alert(
          "Error",
          "No se pudo crear la solicitud. Intente nuevamente."
        );

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
          loading={mutationState.status === "loading"}
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
