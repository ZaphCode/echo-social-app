import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { StaticScreenProps } from "@react-navigation/native";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { cacheVisitedService } from "@/api/services";
import { listServiceRequestsForClient, serviceRequestsKeys } from "@/api/serviceRequests";
import { ServiceWithProvider } from "@/api/types";
import DetailLayout from "@/components/DetailLayout";
import RequestForm from "@/components/forms/RequestForm";
import PersonRow from "@/components/PersonRow";
import ReviewSection from "@/components/ReviewSection";
import Button from "@/components/ui/Button";
import { SlideModal } from "@/components/ui/SlideModal";
import Text from "@/components/ui/Text";
import { useAuthCtx } from "@/context/Auth";
import useCategories from "@/hooks/useCategories";
import useModal from "@/hooks/useModal";
import useTheme from "@/hooks/useTheme";
import useAppNavigation from "@/navigation/useAppNavigation";
import { radius } from "@/theme/theme";
import { formatPrice, formatRelativeShort } from "@/utils/format";

type Props = StaticScreenProps<{ service: ServiceWithProvider }>;

export default function ServiceOverview({ route }: Props) {
  const { service } = route.params;
  const { user } = useAuthCtx();
  const { colors } = useTheme();
  const nav = useAppNavigation();
  const queryClient = useQueryClient();
  const { nameById } = useCategories();
  const [requestVisible, openRequest, closeRequest] = useModal();
  const isOwner = user.id === service.provider;

  const requestsQuery = useQuery({
    queryKey: serviceRequestsKeys.byServiceAndClient(service.id, user.id),
    queryFn: () => listServiceRequestsForClient(service.id, user.id),
  });
  const activeRequest = requestsQuery.data?.[0] ?? null;

  useEffect(() => {
    cacheVisitedService(service);
  }, [service]);

  const category = nameById.get(service.category);

  return (
    <DetailLayout
      photos={service.photos ?? []}
      footer={
        <>
          <View style={styles.price}>
            <Text variant="caption" tone="subtle">
              Precio base
            </Text>
            <Text variant="title">{formatPrice(service.base_price)}</Text>
          </View>
          {isOwner ? (
            <Button
              title="Editar servicio"
              icon="edit-2"
              variant="secondary"
              style={styles.cta}
              onPress={() => nav.editService(service)}
            />
          ) : (
            <Button
              title={activeRequest ? "Ir al chat" : "Solicitar"}
              icon={activeRequest ? "message-circle" : undefined}
              style={styles.cta}
              loading={requestsQuery.isPending}
              onPress={() => (activeRequest ? nav.chat(activeRequest) : openRequest())}
            />
          )}
        </>
      }
    >
      <View style={styles.titleBlock}>
        {category ? (
          <View style={[styles.tag, { backgroundColor: colors.accentSoft }]}>
            <Text variant="caption" bold tone="accent">
              {category}
            </Text>
          </View>
        ) : null}
        <Text variant="display">{service.name}</Text>
        <Text variant="label" tone="subtle">
          {`Publicado ${formatRelativeShort(service.created_at)}`}
        </Text>
      </View>

      <PersonRow
        name={isOwner ? "Tú" : service.provider_profile?.name}
        avatar={service.provider_profile?.avatar}
        caption="Profesional · ver perfil"
        onPress={() =>
          nav.user(service.provider_profile ?? { id: service.provider }, user.id)
        }
      />

      {service.description ? (
        <View style={styles.block}>
          <Text variant="heading">Descripción</Text>
          <Text tone="muted">{service.description}</Text>
        </View>
      ) : null}

      <ReviewSection service={service} />

      <SlideModal visible={requestVisible} onClose={closeRequest}>
        <RequestForm
          service={service}
          defaultPrice={service.base_price.toString()}
          onSuccess={(newRequest) => {
            closeRequest();
            queryClient.invalidateQueries({
              queryKey: serviceRequestsKeys.byServiceAndClient(service.id, user.id),
            });
            queryClient.invalidateQueries({ queryKey: serviceRequestsKeys.allForUser(user.id) });
            if (newRequest) nav.chat(newRequest);
          }}
        />
      </SlideModal>
    </DetailLayout>
  );
}

const styles = StyleSheet.create({
  titleBlock: {
    gap: 8,
  },
  tag: {
    alignSelf: "flex-start",
    height: 26,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    justifyContent: "center",
  },
  block: {
    gap: 6,
  },
  price: {
    flex: 1,
  },
  cta: {
    flex: 1.3,
  },
});
