import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { useController, Control, RegisterOptions } from "react-hook-form";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Text from "../ui/Text";
import { theme } from "@/theme/theme";

type Props = {
  name: string;
  control: Control<any>;
  label?: string;
  rules?: RegisterOptions;
};

export default function StarRatingField({
  name,
  control,
  label,
  rules = {
    required: "Por favor, selecciona una calificación",
    validate: (value) => value > 0 || "La calificación debe ser mayor a 0",
  },
}: Props) {
  const {
    field: { value, onChange },
    fieldState: { error },
  } = useController({ name, control, rules, defaultValue: 0 });

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Pressable
            key={star}
            hitSlop={10}
            onPress={() => onChange(star)}
            style={styles.starPressable}
          >
            <MaterialCommunityIcons
              name={star <= value ? "star" : "star-outline"}
              size={36}
              color={
                star <= value
                  ? theme.colors.primaryBlue
                  : theme.colors.lightGray
              }
              style={{ marginHorizontal: 4 }}
            />
          </Pressable>
        ))}
      </View>
      {error && (
        <Text color={theme.colors.redError} size={15} style={styles.error}>
          {error.message}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  label: {
    marginBottom: 6,
    paddingLeft: theme.spacing.sm,
  },
  starsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.darkGray,
    padding: 8,
    width: "100%",
    borderRadius: 12,
  },
  starPressable: { padding: 2 },
  error: { marginTop: 10 },
});
