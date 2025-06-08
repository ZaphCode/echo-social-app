import { View } from "react-native";
import { AntDesign } from "@expo/vector-icons";

import { Review } from "@/models/Review";
import { theme } from "@/theme/theme";
import { User } from "@/models/User";
import Text from "./ui/Text";

type Props = {
  review: Review;
  authUser: User;
};

export default function ReviewCard({ review }: Props) {
  return (
    <View key={review.id} style={{ gap: 3 }}>
      <Text color="white" size={theme.fontSizes.lg} fontFamily="bold">
        {review.expand!.reviewer.name || "Usuario Anónimo"}
      </Text>
      {review.comment && (
        <Text
          color="white"
          style={{ maxWidth: "85%" }}
          size={theme.fontSizes.md}
        >
          {review.comment}
        </Text>
      )}
      <StarRow rating={review.rating} />
    </View>
  );
}

function StarRow({ rating }: { rating: number }) {
  const stars = [];
  for (let i = 0; i < 5; i++) {
    stars.push(
      <AntDesign
        key={i}
        name={i < rating ? "star" : "staro"}
        size={18}
        color="white"
        style={{ marginRight: 2 }}
      />
    );
  }
  return <View style={{ flexDirection: "row" }}>{stars}</View>;
}
