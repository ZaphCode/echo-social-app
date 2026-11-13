import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { useQuery } from "@tanstack/react-query";

import { listServiceReviews, reviewsKeys } from "@/api/reviews";
import { Service } from "@/models/Service";
import ReviewCard, { Stars } from "./ReviewCard";
import EmptyState from "./ui/EmptyState";
import Loader from "./ui/Loader";
import Text from "./ui/Text";

type Props = { service: Service };

export default function ReviewSection({ service }: Props) {
  const reviewsQuery = useQuery({
    queryKey: reviewsKeys.byService(service.id),
    queryFn: () => listServiceReviews(service.id),
  });
  const reviews = useMemo(() => reviewsQuery.data ?? [], [reviewsQuery.data]);
  const average = useMemo(
    () =>
      reviews.length === 0
        ? 0
        : reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length,
    [reviews],
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="heading">Valoraciones</Text>
        {reviews.length > 0 && (
          <View style={styles.summary}>
            <Text variant="heading">{average.toFixed(1)}</Text>
            <View>
              <Stars rating={average} />
              <Text variant="caption" tone="subtle">
                {`${reviews.length} ${reviews.length === 1 ? "reseña" : "reseñas"}`}
              </Text>
            </View>
          </View>
        )}
      </View>
      {reviewsQuery.isPending ? (
        <Loader inline />
      ) : reviewsQuery.isError ? (
        <Text variant="label" tone="danger">
          No se pudieron cargar las valoraciones.
        </Text>
      ) : reviews.length === 0 ? (
        <EmptyState
          compact
          icon="star"
          title="Sin valoraciones todavía"
          message="Las reseñas aparecen cuando se completa un trato."
        />
      ) : (
        <View style={styles.list}>
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  summary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  list: {
    gap: 10,
  },
});
