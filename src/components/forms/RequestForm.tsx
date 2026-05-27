import {
  Keyboard,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createNotification, notificationsKeys } from "@/api/notifications";
import {
  createServiceRequest,
  serviceRequestsKeys,
  updateServiceRequest,
} from "@/api/serviceRequests";
import { ContractingWithOwner, ServiceRequestWithRelations } from "@/api/types";
import { theme } from "@/theme/theme";
import { Service } from "@/models/Service";
import { useAuthCtx } from "@/context/Auth";
import { validPriceRules } from "@/utils/validations";
import {
  mapContractingSubject,
  mapServiceSubject,
  NegotiationSubject,
} from "@/utils/negotiationSubject";
import Field from "./Field";
import Text from "../ui/Text";
import Button from "../ui/Button";
import DateField from "./DateField";
import { useAlertCtx } from "@/context/Alert";
import useColorScheme from "@/hooks/useColorScheme";

type Props = {
  service?: Service;
  contracting?: ContractingWithOwner;
  subject?: NegotiationSubject;
  onSuccess: (request?: ServiceRequestWithRelations) => void;
  requestId?: string;
  defaultPrice?: string;
  defaultDate?: string;
  offerNotification?: {
    recipientId: string;
    recipientType: "client" | "provider";
  };
};

export default function RequestForm({
  service,
  contracting,
  subject: subjectProp,
  requestId,
  onSuccess,
  defaultDate,
  defaultPrice,
  offerNotification,
}: Props) {
  const { colors } = useColorScheme();
  const { user } = useAuthCtx();
  const { show } = useAlertCtx();
  const offeringMode = !!requestId;
  const queryClient = useQueryClient();
  const subject =
    subjectProp ??
    (contracting
      ? mapContractingSubject(contracting)
      : mapServiceSubject(service as Service & { provider_profile: any }));
  const isContracting = subject.type === "contracting";

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
    }) => updateServiceRequest(id, patch, user.id),
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

        if (offerNotification) {
          try {
            await notificationMutation.mutateAsync({
              user: offerNotification.recipientId,
              message: `*${user.name}* hizo una nueva propuesta para *${subject.name}*`,
              type:
                offerNotification.recipientType === "client"
                  ? "CLIENT:NEW_OFFER"
                  : "PROVIDER:NEW_OFFER",
              read: false,
              request: requestId,
              service: isContracting ? undefined : subject.id,
              contracting: isContracting ? subject.id : undefined,
            });
            queryClient.invalidateQueries({
              queryKey: notificationsKeys.byUser(offerNotification.recipientId),
            });
            queryClient.invalidateQueries({
              queryKey: notificationsKeys.unreadCount(
                offerNotification.recipientId,
              ),
            });
          } catch (err) {
            console.log("Failed to create offer notification:", err);
          }
        }
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
          serviceId: service?.id,
          contractingId: contracting?.id,
          clientId: contracting?.owner ?? user.id,
          providerId: contracting ? user.id : service!.provider,
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

      try {
        await notificationMutation.mutateAsync({
          user: contracting?.owner ?? service!.provider,
          message: contracting
            ? `Nueva aplicación de *${user.name}* para *${subject.name}*`
            : `Nueva solicitud de servicio de *${user.name}* para *${subject.name}*`,
          type: contracting ? "PROVIDER:NEW_APPLICATION" : "PROVIDER:NEW_REQUEST",
          read: false,
          request: newRequest.id,
          service: contracting ? undefined : subject.id,
          contracting: contracting ? subject.id : undefined,
        });
        queryClient.invalidateQueries({
          queryKey: notificationsKeys.byUser(contracting?.owner ?? service!.provider),
        });
        queryClient.invalidateQueries({
          queryKey: notificationsKeys.unreadCount(contracting?.owner ?? service!.provider),
        });
      } catch (err) {
        console.log("Failed to create notification:", err);
      }

      console.log("New request created:", newRequest);

      onSuccess(newRequest);
    }
  });

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text color={colors.text} fontFamily="bold" size={theme.fontSizes.xl}>
          {offeringMode
            ? "Realiza una oferta"
            : isContracting
              ? "Aplicar a Contratación"
              : "Solicitud de Servicio"}
        </Text>
        <View style={styles.fields}>
          <Field
            label={offeringMode ? "Precio" : "Oferta inicial"}
            placeholder={`${subject.base_price}`}
            keyboardType="numeric"
            name="price"
            icon="dollar-sign"
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
              control={control}
              rules={{ required: false, validate: () => true }}
            />
          )}
          <Button
            loading={
              createRequestMutation.isPending || updateRequestMutation.isPending
            }
            title="Enviar"
            onPress={onSubmit}
          />
        </View>
      </ScrollView>
    </TouchableWithoutFeedback>
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
  fields: {
    width: "90%",
    gap: theme.spacing.md,
  },
});
