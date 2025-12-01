import React, { FC, useState } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Pressable,
  Platform,
} from "react-native";
import { Controller, RegisterOptions } from "react-hook-form";
import { Feather } from "@expo/vector-icons";
import { theme } from "@/theme/theme";
import useColorScheme from "@/hooks/useColorScheme";

interface Props {
  name: string;
  label?: string;
  control: any;
  placeholder?: string;
  icon?: keyof typeof Feather.glyphMap;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric";
  rules?: RegisterOptions;
  onFocus?: () => void;
  onSubmitEditing?: () => void;
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
  onFocus,
  onSubmitEditing,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const { colors } = useColorScheme();

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
          {label && (
            <Text style={{ color: colors.text, ...styles.label }}>{label}</Text>
          )}
          <View
            style={{
              ...styles.inputContainer,
              backgroundColor: colors.darkGray,
            }}
          >
            {icon && (
              <Feather
                name={icon}
                size={20}
                color={colors.lightGray}
                style={styles.icon}
              />
            )}
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder={placeholder}
              placeholderTextColor={colors.lightGray}
              secureTextEntry={secureTextEntry && !showPassword}
              keyboardType={keyboardType}
              onBlur={onBlur}
              onFocus={onFocus}
              onChangeText={onChange}
              value={value}
              numberOfLines={3}
              autoCapitalize="none"
              onSubmitEditing={onSubmitEditing}
            />
            {secureTextEntry && (
              <Pressable onPress={() => setShowPassword(!showPassword)}>
                <Feather
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color={colors.lightGray}
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
    // color: theme.colors.lightGray,
    fontFamily: theme.fontFamily.regular,
    fontSize: theme.fontSizes.md,
    marginBottom: theme.spacing.sm,
    marginLeft: theme.spacing.sm,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingVertical: Platform.OS === "android" ? 6 : 4,
    paddingHorizontal: theme.spacing.md,
    shadowColor: "#000000",
    shadowOpacity: 0.05,
    shadowOffset: {
      width: 4,
      height: 4,
    },
  },
  input: {
    flex: 1,
    color: "#fff",
    fontSize: theme.fontSizes.md,
    fontFamily: theme.fontFamily.regular,
    minHeight: 30,
    paddingVertical: theme.spacing.sm,
    textAlignVertical: "center",
    includeFontPadding: false,
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
