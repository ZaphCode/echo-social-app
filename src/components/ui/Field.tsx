import React, { FC, useState } from "react";
import { View, TextInput, StyleSheet, Pressable } from "react-native";
import { Controller, RegisterOptions } from "react-hook-form";
import { Feather } from "@expo/vector-icons";
import { theme } from "@/theme/theme";
import Text from "@/components/ui/Text";

interface Props {
  name: string;
  label: string;
  control: any;
  placeholder?: string;
  icon?: keyof typeof Feather.glyphMap;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric";
  multiline?: boolean;
  numberOfLines?: number;
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
  multiline = false,
  numberOfLines = 1,
  rules,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);

  return (
    <Controller
      name={name}
<<<<<<< Updated upstream
      rules={rules || { required: "Este campo es requerido" }}
      render={({
        field: { onChange, onBlur, value },
        fieldState: { error },
      }) => (
        <View>
          <Text style={styles.label}>{label}</Text>
          <View style={styles.inputContainer}>
=======
      control={control}
      rules={rules}
      render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
        <View style={styles.container}>
          {label && (
            <Text style={styles.label}>
              {label}
            </Text>
          )}
          <View
            style={[
              styles.inputContainer,
              isFocused && styles.inputContainerFocused,
              error && styles.inputContainerError,
              multiline && styles.multilineContainer,
            ]}
          >
>>>>>>> Stashed changes
            {icon && (
              <Feather
                name={icon}
                size={20}
                color={isFocused ? theme.colors.primaryBlue : theme.colors.lightGray}
                style={styles.icon}
              />
            )}
            <TextInput
              style={[
                styles.input,
                icon && styles.inputWithIcon,
                multiline && styles.multilineInput,
              ]}
              placeholder={placeholder}
              placeholderTextColor={theme.colors.lightGray}
<<<<<<< Updated upstream
              secureTextEntry={secureTextEntry && !showPassword}
              keyboardType={keyboardType}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              autoCapitalize="none"
=======
              value={value}
              onChangeText={onChange}
              onBlur={() => {
                onBlur();
                setIsFocused(false);
              }}
              onFocus={() => {
                setIsFocused(true);
                onFocus?.();
              }}
              secureTextEntry={secureTextEntry && !isPasswordVisible}
              keyboardType={keyboardType}
              multiline={multiline}
              numberOfLines={numberOfLines}
              onSubmitEditing={onSubmitEditing}
>>>>>>> Stashed changes
            />
            {secureTextEntry && (
              <Pressable
                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                style={styles.eyeIcon}
              >
                <Feather
                  name={isPasswordVisible ? "eye" : "eye-off"}
                  size={20}
                  color={theme.colors.lightGray}
                />
              </Pressable>
            )}
          </View>
          {error && (
            <Text color="redError" style={styles.errorText}>
              {error.message}
            </Text>
          )}
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  label: {
    marginBottom: 5,
    fontSize: theme.fontSizes.sm,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
<<<<<<< Updated upstream
    backgroundColor: theme.colors.darkGray,
    borderRadius: 12,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
=======
    backgroundColor: theme.colors.darkerGray,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "transparent",
    paddingHorizontal: 15,
    paddingVertical: 12,
>>>>>>> Stashed changes
  },
  inputContainerFocused: {
    borderColor: theme.colors.primaryBlue,
  },
  inputContainerError: {
    borderColor: theme.colors.redError,
  },
  multilineContainer: {
    alignItems: "flex-start",
    minHeight: 100,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: "white",
    fontSize: theme.fontSizes.md,
  },
  inputWithIcon: {
    marginLeft: 5,
  },
  multilineInput: {
    textAlignVertical: "top",
    minHeight: 80,
  },
  eyeIcon: {
    padding: 5,
  },
  errorText: {
    marginTop: 5,
    fontSize: theme.fontSizes.sm,
  },
});

export default Field;
