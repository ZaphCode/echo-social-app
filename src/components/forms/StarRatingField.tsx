import { Pressable, StyleSheet, View } from "react-native";
import { Control, RegisterOptions, useController } from "react-hook-form";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import useTheme from "@/hooks/useTheme";
import Text from "../ui/Text";

type Props = {
  name: string;
  control: Control<any>;
  rules?: RegisterOptions;
};

const LABELS = ["", "Malo", "Regular", "Bien", "Muy bien", "Excelente"];

export default function StarRatingField({
  name,
  control,
  rules = {
    required: "Elige una calificación",
    validate: (value) => value > 0 || "Elige una calificación",
  },
}: Props) {
  const { colors } = useTheme();
  const {
    field: { value, onChange },
    fieldState: { error },
  } = useController({ name, control, rules, defaultValue: 0 });

  return (
    <View style={styles.container}>
      <View style={styles.row} accessibilityRole="radiogroup">
        {[1, 2, 3, 4, 5].map((star) => (
          <Pressable
            key={star}
            hitSlop={6}
            accessibilityRole="radio"
            accessibilityLabel={`${star} ${star === 1 ? "estrella" : "estrellas"}`}
            accessibilityState={{ selected: star === value }}
            onPress={() => onChange(star)}
          >
            <MaterialCommunityIcons
              name={star <= value ? "star" : "star-outline"}
              size={42}
              color={star <= value ? colors.star : colors.surface3}
            />
          </Pressable>
        ))}
      </View>
      <Text variant="label" bold align="center" tone={error ? "danger" : value ? "default" : "subtle"}>
        {error?.message ?? (value ? LABELS[value] : "Toca para calificar")}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    gap: 6,
  },
});
