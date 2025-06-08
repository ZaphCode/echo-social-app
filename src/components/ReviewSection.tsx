import { StyleSheet, View } from "react-native";
import Text from "./ui/Text";
import { theme } from "@/theme/theme";
import useList from "@/hooks/useList";
import { useMemo } from "react";
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import ReviewCard from "./ReviewCard";
import { User } from "@/models/User";
import { Service } from "@/models/Service";
import Loader from "./ui/Loader";

type Props = { service: Service; authUser: User };

export default function ReviewSection({ service, authUser }: Props) {
  const [reviews, { status }] = useList("review", {
    filter: `service = "${service.id}" && reviewer != "${service.provider}"`,
    expand: "reviewer, reviewed",
  });

  const reviewAverage = useMemo(() => {
    if (reviews.length === 0) return 0;
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    return totalRating / reviews.length;
  }, [reviews]);

  if (status === "loading") {
    return (
      <View style={styles.container}>
        <Loader horizontal />
      </View>
    );
  }

  if (status === "error") {
    return <ErrorComponent />;
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

function ErrorComponent() {
  return (
    <View style={styles.errorContainer}>
      <MaterialCommunityIcons
        name="alert-circle-outline"
        size={22}
        color={theme.colors.redError}
      />
      <Text color={theme.colors.redError} size={theme.fontSizes.md}>
        Error al cargar las valoraciones.
      </Text>
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
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    justifyContent: "center",
  },
});
