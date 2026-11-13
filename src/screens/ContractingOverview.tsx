import { StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { StaticScreenProps } from "@react-navigation/native";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { contractingsKeys } from "@/api/contractings";
import {
  listContractingApplicationsForProvider,
  serviceRequestsKeys,
} from "@/api/serviceRequests";
import { ContractingWithOwner } from "@/api/types";
import DetailLayout from "@/components/DetailLayout";
import RequestForm from "@/components/forms/RequestForm";
import PersonRow from "@/components/PersonRow";
import Button from "@/components/ui/Button";
import { SlideModal } from "@/components/ui/SlideModal";
import Text from "@/components/ui/Text";
import { useAuthCtx } from "@/context/Auth";
import useCategories from "@/hooks/useCategories";
import useModal from "@/hooks/useModal";
import useTheme from "@/hooks/useTheme";
import useUserLocation from "@/hooks/useUserLocation";
import useAppNavigation from "@/navigation/useAppNavigation";
import { radius } from "@/theme/theme";
import { formatPrice, formatRelativeShort } from "@/utils/format";
import { distanceKm, formatDistance, toCoords } from "@/utils/geo";

type Props = StaticScreenProps<{ contracting: ContractingWithOwner }>;

export default function ContractingOverview({ route }: Props) {
  const { contracting } = route.params;
  const { user } = useAuthCtx();
  const { colors } = useTheme();
  const nav = useAppNavigation();
  const queryClient = useQueryClient();
  const { nameById } = useCategories();
  const { coords } = useUserLocation();
  const [applyVisible, openApply, closeApply] = useModal();
  const isOwner = user.id === contracting.owner;
  const isProvider = user.role === "provider";
  const canApply = isProvider && !isOwner && !contracting.is_closed;

  const applicationsQuery = useQuery({
    queryKey: serviceRequestsKeys.byContractingAndProvider(contracting.id, user.id),
    queryFn: () => listContractingApplicationsForProvider(contracting.id, user.id),
    enabled: isProvider,
  });
  const activeRequest = applicationsQuery.data?.[0] ?? null;

  const category = nameById.get(contracting.category);
  const distance = isOwner
    ? null
    : formatDistance(distanceKm(coords, toCoords(contracting.lat, contracting.lon)));

  const renderCta = () => {
    if (contracting.is_closed) {
      return <Button title="Contratación completada" variant="secondary" disabled style={styles.cta} />;
    }
    if (isOwner) {
      return (
        <Button
          title="Editar"
          icon="edit-2"
          variant="secondary"
          style={styles.cta}
          onPress={() => nav.editContracting(contracting)}
        />
      );
    }
    if (activeRequest) {
      return (
        <Button title="Ir al chat" icon="message-circle" style={styles.cta} onPress={() => nav.chat(activeRequest)} />
      );
    }
    if (canApply) {
      return (
        <Button title="Aplicar" style={styles.cta} loading={applicationsQuery.isPending} onPress={openApply} />
      );
    }
    return <Button title="Solo profesionales" variant="secondary" disabled style={styles.cta} />;
  };

  return (
    <DetailLayout
      photos={contracting.photos ?? []}
      footer={
        <>
          <View style={styles.price}>
            <Text variant="caption" tone="subtle">
              Presupuesto
            </Text>
            <Text variant="title">{formatPrice(contracting.base_price)}</Text>
          </View>
          {renderCta()}
        </>
      }
    >
      <View style={styles.titleBlock}>
        <View style={styles.tags}>
          <View
            style={[
              styles.tag,
              { backgroundColor: contracting.is_closed ? colors.doneSoft : colors.successSoft },
            ]}
          >
            <Text variant="caption" bold color={contracting.is_closed ? colors.done : colors.success}>
              {contracting.is_closed ? "Completada" : "Abierta"}
            </Text>
          </View>
          {category ? (
            <View style={[styles.tag, { backgroundColor: colors.accentSoft }]}>
              <Text variant="caption" bold tone="accent">
                {category}
              </Text>
            </View>
          ) : null}
        </View>
        <Text variant="display">{contracting.name}</Text>
        <View style={styles.metaRow}>
          <Text variant="label" tone="subtle">
            {`Publicada ${formatRelativeShort(contracting.created_at)}`}
          </Text>
          {distance ? (
            <View style={styles.meta}>
              <Feather name="map-pin" size={13} color={colors.textSubtle} />
              <Text variant="label" tone="subtle">
                {`A ${distance}`}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      <PersonRow
        name={isOwner ? "Tú" : contracting.owner_profile?.name}
        avatar={contracting.owner_profile?.avatar}
        caption="Cliente · ver perfil"
        onPress={() =>
          nav.user(contracting.owner_profile ?? { id: contracting.owner }, user.id)
        }
      />

      {contracting.description ? (
        <View style={styles.block}>
          <Text variant="heading">Lo que necesita</Text>
          <Text tone="muted">{contracting.description}</Text>
        </View>
      ) : null}

      <SlideModal visible={applyVisible} onClose={closeApply}>
        <RequestForm
          contracting={contracting}
          defaultPrice={contracting.base_price.toString()}
          onSuccess={(newRequest) => {
            closeApply();
            queryClient.invalidateQueries({
              queryKey: serviceRequestsKeys.byContractingAndProvider(contracting.id, user.id),
            });
            queryClient.invalidateQueries({ queryKey: serviceRequestsKeys.allForUser(user.id) });
            queryClient.invalidateQueries({ queryKey: contractingsKeys.all });
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
  tags: {
    flexDirection: "row",
    gap: 6,
  },
  tag: {
    height: 26,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    justifyContent: "center",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
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
