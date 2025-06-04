import { StyleSheet, View } from "react-native";
import Text from "./ui/Text";
import { theme } from "@/theme/theme";
import useList from "@/hooks/useList";
import { useMemo } from "react";
import { AntDesign } from "@expo/vector-icons";
import ReviewCard from "./ReviewCard";
import { User } from "@/models/User";
import Button from "./ui/Button";

type Props = { serviceId: string; authUser: User; ableToReview: boolean };

export default function ReviewSection({
  serviceId,
  authUser,
  ableToReview,
}: Props) {
  const [reviews, { status }] = useList("review", {
    filter: `service = "${serviceId}"`,
    expand: "reviewer, reviewed",
  });

  const reviewAverage = useMemo(() => {
    if (reviews.length === 0) return 0;
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    return totalRating / reviews.length;
  }, [reviews]);

  const isReviewable = useMemo(() => {
    return (
      ableToReview &&
      reviews.some((review) => review.expand!.reviewer.id === authUser.id)
    );
  }, [ableToReview, reviews]);

  if (status === "loading") {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.infoContainer}>
        <Text color="white" size={theme.fontSizes.xl + 2} fontFamily="bold">
          Valoraciones
        </Text>
        <View style={styles.averageContainer}>
          <Text color="white" size={theme.fontSizes.lg}>
            {`${reviewAverage}`}
          </Text>
          <AntDesign name="star" size={24} color="white" />
          <Text color={theme.colors.lightGray} size={theme.fontSizes.lg}>
            {`(${reviews.length})`}
          </Text>
        </View>
      </View>
      {isReviewable && (
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Button
            title="Escribir una valoración"
            onPress={() => {}}
            style={{ width: "80%", backgroundColor: theme.colors.darkerGray }}
          />
        </View>
      )}
      <View style={{ gap: theme.spacing.sm }}>
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <ReviewCard review={review} key={review.id} authUser={authUser} />
          ))
        ) : (
          <Text color={theme.colors.lightGray} size={theme.fontSizes.md}>
            Aún no hay valoraciones para este servicio.
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.md,
    paddingBottom: 56,
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  averageContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
});
