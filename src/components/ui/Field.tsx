import React, { FC, useState } from "react";
import { View, TextInput, Text, StyleSheet, Pressable } from "react-native";
import { Controller, RegisterOptions } from "react-hook-form";
import { Feather } from "@expo/vector-icons";
import { theme } from "@/theme/theme";

interface Props {
  name: string;
  label: string;
  control: any;
  placeholder?: string;
  icon?: keyof typeof Feather.glyphMap;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric";
  rules?: RegisterOptions;
}

const Field: FC<Props> = ({
  name,
  label,
  control,
  placeholder,
  icon,
  secureTextEntry = false,
  keyboardType = "default",
  rules,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Controller
      control={control}
      name={name}
      rules={rules || { required: "Este campo es requerido" }}
      render={({
        field: { onChange, onBlur, value },
        fieldState: { error },
      }) => (
        <View>
          <Text style={styles.label}>{label}</Text>
          <View style={styles.inputContainer}>
            {icon && (
              <Feather
                name={icon}
                size={20}
                color={theme.colors.lightGray}
                style={styles.icon}
              />
            )}
            <TextInput
              style={styles.input}
              placeholder={placeholder}
              placeholderTextColor={theme.colors.lightGray}
              secureTextEntry={secureTextEntry && !showPassword}
              keyboardType={keyboardType}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              autoCapitalize="none"
            />
            {secureTextEntry && (
              <Pressable onPress={() => setShowPassword(!showPassword)}>
                <Feather
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color={theme.colors.lightGray}
                />
              </Pressable>
            )}
          </View>
          {error && <Text style={styles.error}>{error.message}</Text>}
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  label: {
    color: theme.colors.lightGray,
    fontFamily: theme.fontFamily.regular,
    fontSize: theme.fontSizes.md,
    marginBottom: theme.spacing.sm,
    marginLeft: theme.spacing.sm,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.darkGray,
    borderRadius: 12,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  input: {
    flex: 1,
    color: "#fff",
    fontSize: theme.fontSizes.md,
    fontFamily: theme.fontFamily.regular,
  },
  icon: {
    marginRight: 10,
  },
  error: {
    color: theme.colors.redError,
    marginTop: theme.spacing.sm,
    fontSize: theme.fontSizes.sm,
  },
});

export default Field;
