import { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { useForm } from "react-hook-form";

import { theme } from "@/theme/theme";
import { useKeyboardVisible } from "@/hooks/useKeyboardVisible";
import { Service } from "@/models/Service";
import Field from "./ui/Field";
import Text from "./ui/Text";
import Button from "./ui/Button";
import DateField from "./ui/DateField";
import useCreate from "@/hooks/useCreate";
import { useAuthCtx } from "@/context/Auth";
import { validPriceRules } from "@/utils/validations";
import { ServiceRequest } from "@/models/ServiceRequest";

type Props = {
  service: Service;
  onSuccess: (request: ServiceRequest) => void;
};

export default function RequestForm({ service, onSuccess }: Props) {
  const { user } = useAuthCtx();
  const keyboardVisible = useKeyboardVisible();
  const [offsetHeight, setOffsetHeight] = useState(0);

  const { control, handleSubmit } = useForm({
    defaultValues: {
      price: "",
      date: "",
      notes: "",
    },
  });

  const { create, mutationState } = useCreate("service_request", {
    expand: "service.provider, client",
  });

  const onSubmit = handleSubmit(async (data) => {
    const newRequest = await create({
      service: service.id,
      client: user.id,
      agreed_price: parseFloat(data.price),
      agreed_date: data.date,
      notes: data.notes,
      status: "PENDING",
    });

    if (mutationState.status === "error" || !newRequest) {
      return Alert.alert(
        "Error",
        "No se pudo crear la solicitud. Intente nuevamente."
      );
    }

    onSuccess(newRequest);
  });

  return (
    <View style={styles.container}>
      <Text color="white" fontFamily="bold" size={theme.fontSizes.xl}>
        Solicitud de Servicio
      </Text>
      <View style={{ width: "90%", gap: theme.spacing.md }}>
        <Field
          label="Oferta inicial"
          placeholder={`${service.base_price}`}
          keyboardType="numeric"
          name="price"
          icon="dollar-sign"
          onFocus={() => setOffsetHeight(10)}
          control={control}
          rules={validPriceRules}
        />
        <DateField control={control} name="date" label="Fecha" />
        <Field
          label="Notas (opcional)"
          placeholder="Especifique algo..."
          icon="edit"
          name="notes"
          onFocus={() => setOffsetHeight(220)}
          control={control}
          rules={{ required: false, validate: () => true }}
        />
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
