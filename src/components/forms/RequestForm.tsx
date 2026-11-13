import { ScrollView, StyleSheet, View } from "react-native";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createNotification, notificationsKeys } from "@/api/notifications";
import {
  createServiceRequest,
  serviceRequestsKeys,
  updateServiceRequest,
} from "@/api/serviceRequests";
import { ContractingWithOwner, ServiceRequestWithRelations } from "@/api/types";
import { formatPrice } from "@/utils/format";
import { Service } from "@/models/Service";
import { useAuthCtx } from "@/context/Auth";
import { useNegotiationCtx } from "@/context/Negotiation";
import { useOffline } from "@/context/Offline";
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
import useTheme from "@/hooks/useTheme";
import StorageImage from "../ui/StorageImage";

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
  const { colors } = useTheme();
  const { user } = useAuthCtx();
  const { show } = useAlertCtx();
  const { isOnline } = useOffline();
  const negotiation = useNegotiationCtx();
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
      queryClient.invalidateQueries({
        queryKey: serviceRequestsKeys.allForUser(user.id),
      });
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
    onSuccess: (updatedRequest) => {
      queryClient.setQueryData(
        serviceRequestsKeys.detail(updatedRequest.id),
        updatedRequest,
      );
      queryClient.invalidateQueries({
        queryKey: serviceRequestsKeys.allForUser(user.id),
      });
    },
  });

  const notificationMutation = useMutation({
    mutationFn: createNotification,
  });

  const onSubmit = handleSubmit(async (data) => {
    if (offeringMode) {
      let updatedRequest: ServiceRequestWithRelations;

      try {
        updatedRequest = await updateRequestMutation.mutateAsync({
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
          iconColor: colors.danger,
        });
      }

      if (negotiation.setRequest) {
        negotiation.setRequest(updatedRequest);
      }

      if (!isOnline) {
        show({
          title: "Propuesta guardada sin conexión",
          message:
            "Actualizamos la propuesta en tu app. Se enviará a la otra persona cuando recuperes conexión; si esa persona hace cambios antes, el estado final puede actualizarse al sincronizar.",
          icon: "cloud-sync",
          iconColor: colors.accent,
        });
      }

      onSuccess(updatedRequest);
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
          iconColor: colors.danger,
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

      onSuccess(newRequest);
    }
  });

  const title = offeringMode
    ? "Hacer contraoferta"
    : isContracting
      ? "Aplicar a la contratación"
      : "Solicitar servicio";
  const priceLabel = offeringMode
    ? "Tu propuesta"
    : isContracting
      ? "Tu cotización"
      : "Tu oferta inicial";

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Text variant="title">{title}</Text>
      <View style={[styles.subject, { backgroundColor: colors.surface2 }]}>
        <StorageImage bucket="service-photos" path={subject.photos?.[0]} style={styles.subjectImage} />
        <View style={styles.flex}>
          <Text bold numberOfLines={1}>
            {subject.name}
          </Text>
          <Text variant="label" tone="muted">
            {`${isContracting ? "Presupuesto" : "Precio base"} ${formatPrice(subject.base_price)}`}
          </Text>
        </View>
      </View>
      <Field
        label={priceLabel}
        placeholder={`${subject.base_price}`}
        keyboardType="numeric"
        name="price"
        icon="dollar-sign"
        control={control}
        rules={validPriceRules}
      />
      <DateField control={control} name="date" label="Fecha propuesta" />
      {!offeringMode && (
        <Field
          label="Notas (opcional)"
          placeholder="Detalles que el otro debe saber"
          name="notes"
          control={control}
          autoCapitalize="sentences"
          multiline
          rules={{ required: false, validate: () => true }}
        />
      )}
      <Button
        loading={createRequestMutation.isPending || updateRequestMutation.isPending}
        title={offeringMode ? "Enviar contraoferta" : isContracting ? "Enviar aplicación" : "Enviar solicitud"}
        onPress={onSubmit}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    paddingBottom: 20,
  },
  subject: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 10,
    borderRadius: 18,
  },
  subjectImage: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  flex: {
    flex: 1,
  },
});
