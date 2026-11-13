import { StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ReviewWithProfiles } from "@/api/types";
import useTheme from "@/hooks/useTheme";
import { radius } from "@/theme/theme";
import { formatRelativeShort } from "@/utils/format";
import Avatar from "./ui/Avatar";
import Text from "./ui/Text";

type Props = { review: ReviewWithProfiles };

export default function ReviewCard({ review }: Props) {
  const { colors } = useTheme();
  const name = review.reviewer_profile?.name || "Usuario";

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <Avatar name={name} path={review.reviewer_profile?.avatar} size={36} />
        <View style={styles.flex}>
          <Text variant="label" bold numberOfLines={1}>
            {name}
          </Text>
          <Stars rating={review.rating} />
        </View>
        <Text variant="caption" tone="subtle">
          {formatRelativeShort(review.created_at)}
        </Text>
      </View>
      {review.comment ? (
        <Text variant="label" tone="muted">
          {review.comment}
        </Text>
      ) : null}
    </View>
  );
}

export function Stars({ rating, size = 13 }: { rating: number; size?: number }) {
  const { colors } = useTheme();
  return (
    <View
      style={styles.stars}
      accessibilityLabel={`${rating} de 5 estrellas`}
      accessibilityRole="image"
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <Feather
          key={star}
          name="star"
          size={size}
          color={star <= Math.round(rating) ? colors.star : colors.surface3}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    borderRadius: radius.card,
    gap: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  flex: {
    flex: 1,
    gap: 2,
  },
  stars: {
    flexDirection: "row",
    gap: 2,
  },
});
