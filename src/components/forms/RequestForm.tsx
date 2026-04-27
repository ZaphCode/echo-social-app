import { useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createNotification } from "@/api/notifications";
import {
  createServiceRequest,
  serviceRequestsKeys,
  updateServiceRequest,
} from "@/api/serviceRequests";
import { ServiceRequestWithRelations } from "@/api/types";
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
import { useAlertCtx } from "@/context/Alert";
import useColorScheme from "@/hooks/useColorScheme";

const DEVICE_HEIGHT = Dimensions.get("window").height;

type Props = {
  service: Service;
  onSuccess: (request?: ServiceRequestWithRelations) => void;
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
  const { colors } = useColorScheme();
  const { user } = useAuthCtx();
  const { show } = useAlertCtx();
  const keyboardVisible = useKeyboardVisible();
  const [offsetHeight, setOffsetHeight] = useState(0);
  const offeringMode = !!requestId;
  const queryClient = useQueryClient();

  const { control, handleSubmit } = useForm({
    defaultValues: {
      price: defaultPrice || "",
      date: defaultDate || "",
      notes: "",
    },
  });

  const createRequestMutation = useMutation({
    mutationFn: createServiceRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceRequestsKeys.all });
    },
  });

  const updateRequestMutation = useMutation({
    mutationFn: ({
      id,
      patch,
    }: {
      id: string;
      patch: Parameters<typeof updateServiceRequest>[1];
    }) => updateServiceRequest(id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceRequestsKeys.all });
    },
  });

  const notificationMutation = useMutation({
    mutationFn: createNotification,
  });

  const onSubmit = handleSubmit(async (data) => {
    if (offeringMode) {
      try {
        await updateRequestMutation.mutateAsync({
          id: requestId!,
          patch: {
            agreed_price: parseFloat(data.price),
            agreed_date: data.date,
            client_offer_status: "PENDING",
            provider_offer_status: "PENDING",
            last_offer_user: user.id,
          },
        });
      } catch {
        return show({
          title: "Error al Ofertar",
          message: "No se pudo enviar tu oferta. Intente nuevamente.",
          icon: "alert-circle",
          iconColor: theme.colors.redError,
        });
      }

      onSuccess();
    } else {
      let newRequest: ServiceRequestWithRelations;

      try {
        newRequest = await createRequestMutation.mutateAsync({
          serviceId: service.id,
          clientId: user.id,
          lastOfferUserId: user.id,
          agreedPrice: parseFloat(data.price),
          agreedDate: data.date,
          notes: data.notes,
        });
      } catch {
        return show({
          title: "Error al Solicitar Servicio",
          message: "No se pudo enviar tu solicitud. Intente nuevamente.",
          icon: "alert-circle",
          iconColor: theme.colors.redError,
        });
      }

      await notificationMutation.mutateAsync({
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
      <Text color={colors.text} fontFamily="bold" size={theme.fontSizes.xl}>
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
          loading={createRequestMutation.isPending || updateRequestMutation.isPending}
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
