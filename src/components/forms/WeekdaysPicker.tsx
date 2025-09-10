import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import Text from "@/components/ui/Text";
import { Controller, Control, RegisterOptions } from "react-hook-form";
import { theme } from "@/theme/theme";

const weekDays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const dayLabels = {
  MON: "Lu",
  TUE: "Ma",
  WED: "Mi",
  THU: "Ju",
  FRI: "Vi",
  SAT: "Sa",
  SUN: "Do",
};

interface Props {
  name: string;
  control: Control<any>;
  label?: string;
  rules?: RegisterOptions;
}

export default function WeekDaysPicker({ name, control, label, rules }: Props) {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      defaultValue={[]} // Por defecto vacío
      render={({ field: { value = [], onChange }, fieldState: { error } }) => (
        <View style={{ marginBottom: 10 }}>
          {label && <Text style={styles.label}>{label}</Text>}
          <View style={styles.container}>
            {weekDays.map((day) => (
              <Pressable
                key={day}
                style={[
                  styles.chip,
                  value.includes(day) && styles.chipSelected,
                ]}
                onPress={() => {
                  let updated: string[];
                  if (value.includes(day)) {
                    updated = value.filter((d: string) => d !== day);
                  } else {
                    updated = [...value, day];
                  }
                  onChange(updated);
                }}
              >
                <Text
                  style={[
                    styles.chipText,
                    value.includes(day) && styles.chipTextSelected,
                  ]}
                >
                  {dayLabels[day as keyof typeof dayLabels]}
                </Text>
              </Pressable>
            ))}
          </View>
          {error && (
            <Text color={theme.colors.redError} size={theme.fontSizes.sm}>
              {error.message}
            </Text>
          )}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 8,
    marginVertical: 10,
    flexWrap: "wrap",
  },
  label: {
    color: theme.colors.lightGray,
    fontFamily: theme.fontFamily.regular,
    fontSize: theme.fontSizes.md,
    marginLeft: theme.spacing.sm,
  },
  chip: {
    backgroundColor: theme.colors.darkGray,
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "transparent",
  },
  chipSelected: {
    backgroundColor: theme.colors.secondaryBlue,
  },
  chipText: {
    color: theme.colors.lightGray,
    fontFamily: theme.fontFamily.regular,
    fontSize: 15,
  },
  chipTextSelected: {
    color: theme.colors.primaryBlue,
    fontFamily: theme.fontFamily.bold,
  },
});
