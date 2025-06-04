import { View } from "react-native";
import React from "react";
import { Review } from "@/models/Review";
import { theme } from "@/theme/theme";
import Text from "./ui/Text";
import { AntDesign } from "@expo/vector-icons";
import { User } from "@/models/User";

type Props = {
  review: Review;
  authUser: User;
};

export default function ReviewCard({ review, authUser }: Props) {
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
      {review.expand?.reviewer.id === authUser.id && (
        <View style={{ position: "absolute", right: 0, top: 20 }}>
          <AntDesign
            name="delete"
            size={24}
            color={theme.colors.redError}
            style={{ marginLeft: 8 }}
          />
        </View>
      )}
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
