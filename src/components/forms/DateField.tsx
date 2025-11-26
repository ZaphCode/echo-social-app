import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Controller } from "react-hook-form";
import { Feather } from "@expo/vector-icons";
import { theme } from "@/theme/theme";
import { formatDate } from "@/utils/format";
import { validDateRules } from "@/utils/validations";
import useColorScheme from "@/hooks/useColorScheme";

interface Props {
  name: string;
  label?: string;
  control: any;
}

export default function DateField({ name, label, control }: Props) {
  const [showPicker, setShowPicker] = useState(false);
  const { colors } = useColorScheme();

  return (
    <Controller
      control={control}
      name={name}
      defaultValue=""
      rules={validDateRules}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <View>
          {label && (
            <Text style={[styles.label, { color: colors.lightGray }]}>
              {label}
            </Text>
          )}

          <Pressable
            onPress={() => setShowPicker(true)}
            style={{
              ...styles.inputContainer,
              borderColor: error ? colors.redError : colors.lightGray,
              borderWidth: 1,
            }}
          >
            <Feather
              name="calendar"
              size={20}
              color={colors.lightGray}
              style={styles.icon}
            />
            <Text
              style={{
                ...styles.inputText,
                color: value ? colors.text : colors.lightGray,
              }}
            >
              {value
                ? formatDate(new Date(value).toUTCString())
                : "Selecciona una fecha"}
            </Text>
          </Pressable>

          {error && <Text style={styles.error}>{error.message}</Text>}

          {showPicker && (
            <DateTimePicker
              value={value ? new Date(value) : new Date()}
              mode="date"
              minimumDate={new Date()}
              textColor="white"
              themeVariant="dark"
              display={Platform.OS === "ios" ? "inline" : "default"}
              onChange={(_, selectedDate) => {
                if (selectedDate) {
                  onChange(selectedDate.toISOString());
                  setShowPicker(false);
                }
              }}
            />
          )}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: theme.fontFamily.regular,
    fontSize: theme.fontSizes.md,
    marginBottom: theme.spacing.sm,
    marginLeft: theme.spacing.sm,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: Platform.OS === "android" ? 17 : 14,
  },
  icon: {
    marginRight: 10,
  },
  inputText: {
    color: "#fff",
    fontSize: theme.fontSizes.md,
    fontFamily: theme.fontFamily.regular,
  },
  error: {
    color: theme.colors.redError,
    marginTop: theme.spacing.sm,
    fontSize: theme.fontSizes.sm,
  },
});
