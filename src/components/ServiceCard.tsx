import { memo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";

import { getServiceReviewSummary, reviewsKeys } from "@/api/reviews";
import { serviceProviderCoords } from "@/api/services";
import { ServiceWithProvider } from "@/api/types";
import useCategories from "@/hooks/useCategories";
import useTheme from "@/hooks/useTheme";
import useUserLocation from "@/hooks/useUserLocation";
import { User } from "@/models/User";
import useAppNavigation from "@/navigation/useAppNavigation";
import { radius } from "@/theme/theme";
import { formatPrice, formatRelativeShort } from "@/utils/format";
import { distanceKm, formatDistance } from "@/utils/geo";
import Avatar from "./ui/Avatar";
import Button from "./ui/Button";
import StorageImage from "./ui/StorageImage";
import Text from "./ui/Text";

type Props = {
  authUser: User;
  service: ServiceWithProvider;
};

/** Feed post for a service: provider row, cover photo, title, price, CTA. */
function ServiceCard({ service, authUser }: Props) {
  const { colors } = useTheme();
  const nav = useAppNavigation();
  const { nameById } = useCategories();
  const { coords } = useUserLocation();
  const isOwner = authUser.id === service.provider;

  const reviewSummary = useQuery({
    queryKey: reviewsKeys.serviceSummary(service.id),
    queryFn: () => getServiceReviewSummary(service.id),
    staleTime: 1000 * 60 * 5,
  }).data;

  const distance = isOwner
    ? null
    : formatDistance(distanceKm(coords, serviceProviderCoords(service)));
  const meta = [nameById.get(service.category), formatRelativeShort(service.created_at)]
    .filter(Boolean)
    .join(" · ");
  const open = () => nav.service(service);
  const photoCount = service.photos?.length ?? 0;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.line }]}>
      <View style={styles.header}>
        <Avatar
          name={service.provider_profile?.name}
          path={service.provider_profile?.avatar}
          size={40}
        />
        <View style={styles.headerText}>
          <Text bold numberOfLines={1} tone={isOwner ? "accent" : "default"}>
            {isOwner ? "Tú" : service.provider_profile?.name || "Profesional"}
          </Text>
          <Text variant="caption" tone="subtle" numberOfLines={1}>
            {meta}
          </Text>
        </View>
        {isOwner ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Editar servicio"
            onPress={() => nav.editService(service)}
            hitSlop={8}
            style={[styles.chip, { backgroundColor: colors.accentSoft }]}
          >
            <Feather name="edit-2" size={13} color={colors.accentText} />
            <Text variant="caption" bold tone="accent">
              Editar
            </Text>
          </Pressable>
        ) : reviewSummary && reviewSummary.count > 0 ? (
          <View style={[styles.chip, { backgroundColor: colors.surface2 }]}>
            <Feather name="star" size={13} color={colors.star} />
            <Text variant="caption" bold>
              {reviewSummary.average.toFixed(1)}
            </Text>
            <Text variant="caption" tone="subtle">
              {`(${reviewSummary.count})`}
            </Text>
          </View>
        ) : null}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Ver ${service.name}`}
        onPress={open}
        style={styles.photoWrap}
      >
        <StorageImage bucket="service-photos" path={service.photos?.[0]} style={styles.photo} />
        {photoCount > 1 && (
          <View style={styles.dots}>
            {Array.from({ length: Math.min(photoCount, 5) }, (_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === 0 ? styles.dotActive : null,
                ]}
              />
            ))}
          </View>
        )}
        {distance ? (
          <View style={styles.distance}>
            <Feather name="map-pin" size={12} color="#FFFFFF" />
            <Text variant="caption" bold color="#FFFFFF">
              {distance}
            </Text>
          </View>
        ) : null}
      </Pressable>

      <View style={styles.footer}>
        <Pressable onPress={open} style={styles.footerText}>
          <Text bold numberOfLines={2}>
            {service.name}
          </Text>
          <Text variant="label" tone="muted">
            {"Desde "}
            <Text variant="label" bold>
              {formatPrice(service.base_price)}
            </Text>
          </Text>
        </Pressable>
        {!isOwner && <Button title="Solicitar" size="sm" onPress={open} />}
      </View>
    </View>
  );
}

export default memo(ServiceCard);

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.feed,
    borderWidth: 1,
    padding: 12,
    gap: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 4,
    paddingTop: 2,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    height: 30,
    paddingHorizontal: 11,
    borderRadius: 15,
  },
  photoWrap: {
    height: 196,
    borderRadius: 20,
    overflow: "hidden",
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  dots: {
    position: "absolute",
    left: 12,
    bottom: 12,
    flexDirection: "row",
    gap: 4,
  },
  dot: {
    width: 6,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  dotActive: {
    width: 18,
    backgroundColor: "#FFFFFF",
  },
  distance: {
    position: "absolute",
    right: 10,
    bottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    height: 26,
    paddingHorizontal: 9,
    borderRadius: 13,
    backgroundColor: "rgba(14,15,17,0.6)",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 4,
    paddingBottom: 4,
  },
  footerText: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
});
