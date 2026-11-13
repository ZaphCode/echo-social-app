import { useState } from "react";
import { Platform, Pressable, StyleSheet } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Control, Controller } from "react-hook-form";
import { Feather } from "@expo/vector-icons";

import useTheme from "@/hooks/useTheme";
import { radius } from "@/theme/theme";
import { validDateRules } from "@/utils/validations";
import Text from "../ui/Text";
import { FieldShell } from "./Field";

type Props = {
  name: string;
  label?: string;
  control: Control<any>;
};

const formatter = new Intl.DateTimeFormat("es-MX", {
  weekday: "short",
  day: "numeric",
  month: "long",
  year: "numeric",
});

export default function DateField({ name, label, control }: Props) {
  const [showPicker, setShowPicker] = useState(false);
  const { colors, mode } = useTheme();

  return (
    <Controller
      control={control}
      name={name}
      defaultValue=""
      rules={validDateRules}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <FieldShell label={label} error={error?.message}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={label ?? "Elegir fecha"}
            onPress={() => setShowPicker((open) => !open)}
            style={[
              styles.box,
              {
                backgroundColor: colors.surface,
                borderColor: error ? colors.danger : showPicker ? colors.accent : colors.line,
              },
            ]}
          >
            <Feather name="calendar" size={18} color={colors.textSubtle} />
            <Text tone={value ? "default" : "subtle"} style={styles.flex}>
              {value ? formatter.format(new Date(value)) : "Selecciona una fecha"}
            </Text>
            <Feather name={showPicker ? "chevron-up" : "chevron-down"} size={18} color={colors.textSubtle} />
          </Pressable>

          {showPicker && (
            <DateTimePicker
              value={value ? new Date(value) : new Date()}
              mode="date"
              minimumDate={new Date()}
              textColor={colors.text}
              accentColor={colors.accent}
              themeVariant={mode}
              display={Platform.OS === "ios" ? "inline" : "default"}
              onChange={(_, selectedDate) => {
                if (Platform.OS !== "ios") setShowPicker(false);
                if (selectedDate) {
                  onChange(selectedDate.toISOString());
                  setShowPicker(false);
                }
              }}
            />
          )}
        </FieldShell>
      )}
    />
  );
}

const styles = StyleSheet.create({
  box: {
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: radius.input,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  flex: {
    flex: 1,
  },
});
