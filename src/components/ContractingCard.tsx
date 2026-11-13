import { memo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ContractingWithOwner } from "@/api/types";
import useTheme from "@/hooks/useTheme";
import useUserLocation from "@/hooks/useUserLocation";
import { User } from "@/models/User";
import useAppNavigation from "@/navigation/useAppNavigation";
import { radius } from "@/theme/theme";
import { formatPrice, formatRelativeShort } from "@/utils/format";
import { distanceKm, formatDistance, toCoords } from "@/utils/geo";
import Avatar from "./ui/Avatar";
import Button from "./ui/Button";
import StorageImage from "./ui/StorageImage";
import Text from "./ui/Text";

type Props = {
  authUser: User;
  contracting: ContractingWithOwner;
};

/** Feed post for a contratación: who needs it, what, reference photos, budget. */
function ContractingCard({ contracting, authUser }: Props) {
  const { colors } = useTheme();
  const nav = useAppNavigation();
  const { coords } = useUserLocation();
  const isOwner = authUser.id === contracting.owner;
  const isClosed = contracting.is_closed;
  const distance = isOwner
    ? null
    : formatDistance(distanceKm(coords, toCoords(contracting.lat, contracting.lon)));
  const photos = (contracting.photos ?? []).slice(0, 2);
  const open = () => nav.contracting(contracting);

  const cta = isClosed
    ? null
    : isOwner
      ? { title: "Editar", onPress: () => nav.editContracting(contracting), variant: "secondary" as const }
      : authUser.role === "provider"
        ? { title: "Aplicar", onPress: open, variant: "primary" as const }
        : { title: "Ver", onPress: open, variant: "secondary" as const };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ver ${contracting.name}`}
      onPress={open}
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.line }]}
    >
      <View style={styles.header}>
        <Avatar
          name={contracting.owner_profile?.name}
          path={contracting.owner_profile?.avatar}
          size={40}
        />
        <View style={styles.headerText}>
          <Text bold numberOfLines={1} tone={isOwner ? "accent" : "default"}>
            {isOwner ? "Tú" : contracting.owner_profile?.name || "Cliente"}
          </Text>
          <Text variant="caption" tone="subtle" numberOfLines={1}>
            {`Busca profesional · ${formatRelativeShort(contracting.created_at)}`}
          </Text>
        </View>
        <View
          style={[
            styles.state,
            { backgroundColor: isClosed ? colors.doneSoft : colors.successSoft },
          ]}
        >
          <View
            style={[styles.stateDot, { backgroundColor: isClosed ? colors.done : colors.success }]}
          />
          <Text variant="caption" bold color={isClosed ? colors.done : colors.success}>
            {isClosed ? "Completada" : "Abierta"}
          </Text>
        </View>
      </View>

      <View style={styles.body}>
        <Text variant="heading" numberOfLines={2}>
          {contracting.name}
        </Text>
        {contracting.description ? (
          <Text variant="label" tone="muted" numberOfLines={2}>
            {contracting.description}
          </Text>
        ) : null}
      </View>

      {photos.length > 0 && (
        <View style={styles.photos}>
          {photos.map((path, index) => (
            <StorageImage
              key={path}
              bucket="service-photos"
              path={path}
              style={[
                styles.photo,
                photos.length === 2 && (index === 0 ? styles.photoLeft : styles.photoRight),
                photos.length === 2 && { flex: index === 0 ? 2 : 1 },
              ]}
            />
          ))}
        </View>
      )}

      <View style={styles.footer}>
        <View style={styles.budget}>
          <Text variant="caption" tone="subtle">
            Presupuesto
          </Text>
          <Text variant="heading">{formatPrice(contracting.base_price)}</Text>
        </View>
        {distance ? (
          <View style={styles.distance}>
            <Feather name="map-pin" size={13} color={colors.textMuted} />
            <Text variant="caption" tone="muted">
              {distance}
            </Text>
          </View>
        ) : null}
        {cta ? (
          <Button title={cta.title} variant={cta.variant} size="sm" onPress={cta.onPress} />
        ) : null}
      </View>
    </Pressable>
  );
}

export default memo(ContractingCard);

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.feed,
    borderWidth: 1,
    padding: 16,
    gap: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  state: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 26,
    paddingHorizontal: 10,
    borderRadius: 13,
  },
  stateDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  body: {
    gap: 6,
  },
  photos: {
    flexDirection: "row",
    gap: 6,
    height: 132,
  },
  photo: {
    flex: 1,
    height: "100%",
    borderRadius: 18,
  },
  photoLeft: {
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
  },
  photoRight: {
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  budget: {
    flex: 1,
  },
  distance: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
});
