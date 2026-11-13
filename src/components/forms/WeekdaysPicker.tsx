import { Pressable, StyleSheet, View } from "react-native";
import { Control, Controller, RegisterOptions } from "react-hook-form";

import useTheme from "@/hooks/useTheme";
import { radius } from "@/theme/theme";
import Text from "../ui/Text";
import { FieldShell } from "./Field";

export const WEEK_DAYS = [
  { key: "MON", short: "Lu", label: "Lun" },
  { key: "TUE", short: "Ma", label: "Mar" },
  { key: "WED", short: "Mi", label: "Mié" },
  { key: "THU", short: "Ju", label: "Jue" },
  { key: "FRI", short: "Vi", label: "Vie" },
  { key: "SAT", short: "Sá", label: "Sáb" },
  { key: "SUN", short: "Do", label: "Dom" },
] as const;

type Props = {
  name: string;
  control: Control<any>;
  label?: string;
  rules?: RegisterOptions;
};

export default function WeekDaysPicker({ name, control, label, rules }: Props) {
  const { colors } = useTheme();

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      defaultValue={[]}
      render={({ field: { value = [], onChange }, fieldState: { error } }) => (
        <FieldShell label={label} error={error?.message}>
          <View style={styles.row}>
            {WEEK_DAYS.map((day) => {
              const selected = value.includes(day.key);
              return (
                <Pressable
                  key={day.key}
                  accessibilityRole="checkbox"
                  accessibilityLabel={day.label}
                  accessibilityState={{ checked: selected }}
                  onPress={() =>
                    onChange(
                      selected
                        ? value.filter((d: string) => d !== day.key)
                        : [...value, day.key],
                    )
                  }
                  style={[
                    styles.day,
                    {
                      backgroundColor: selected ? colors.accent : colors.surface,
                      borderColor: selected ? colors.accent : colors.line,
                    },
                  ]}
                >
                  <Text variant="label" bold color={selected ? colors.onAccent : colors.textMuted}>
                    {day.short}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </FieldShell>
      )}
    />
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 6,
  },
  day: {
    flex: 1,
    aspectRatio: 1,
    maxWidth: 46,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
