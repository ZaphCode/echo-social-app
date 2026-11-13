import { ComponentProps, ReactNode, useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { Control, Controller, RegisterOptions } from "react-hook-form";
import { Feather } from "@expo/vector-icons";

import useTheme from "@/hooks/useTheme";
import { fonts, radius } from "@/theme/theme";
import Text from "../ui/Text";

type Props = {
  name: string;
  label?: string;
  control: Control<any>;
  placeholder?: string;
  icon?: ComponentProps<typeof Feather>["name"];
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  autoCapitalize?: "none" | "sentences" | "words";
  multiline?: boolean;
  rules?: RegisterOptions;
  hint?: string;
  onFocus?: () => void;
  onSubmitEditing?: () => void;
};

export default function Field({
  name,
  label,
  control,
  placeholder,
  icon,
  secureTextEntry = false,
  keyboardType = "default",
  autoCapitalize = "none",
  multiline = false,
  rules,
  hint,
  onFocus,
  onSubmitEditing,
}: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);
  const { colors } = useTheme();

  return (
    <Controller
      control={control}
      name={name}
      rules={rules || { required: "Este campo es requerido" }}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <FieldShell label={label} error={error?.message} hint={hint}>
          <View
            style={[
              styles.box,
              multiline && styles.boxMultiline,
              {
                backgroundColor: colors.surface,
                borderColor: error ? colors.danger : focused ? colors.accent : colors.line,
              },
            ]}
          >
            {icon && (
              <Feather
                name={icon}
                size={18}
                color={focused ? colors.accentText : colors.textSubtle}
                style={multiline && styles.iconTop}
              />
            )}
            <TextInput
              style={[styles.input, multiline && styles.inputMultiline, { color: colors.text }]}
              placeholder={placeholder}
              placeholderTextColor={colors.textSubtle}
              secureTextEntry={secureTextEntry && !showPassword}
              keyboardType={keyboardType}
              onBlur={() => {
                setFocused(false);
                onBlur();
              }}
              onFocus={() => {
                setFocused(true);
                onFocus?.();
              }}
              onChangeText={onChange}
              value={value === undefined || value === null ? "" : String(value)}
              multiline={multiline}
              autoCapitalize={autoCapitalize}
              onSubmitEditing={onSubmitEditing}
              accessibilityLabel={label ?? placeholder}
            />
            {secureTextEntry && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                hitSlop={10}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Feather
                  name={showPassword ? "eye-off" : "eye"}
                  size={18}
                  color={colors.textSubtle}
                />
              </Pressable>
            )}
          </View>
        </FieldShell>
      )}
    />
  );
}

/** Label + control + error/hint, shared by every form control. */
export function FieldShell({
  label,
  error,
  hint,
  children,
}: {
  label?: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.shell}>
      {label ? (
        <Text variant="label" bold tone="muted" style={styles.label}>
          {label}
        </Text>
      ) : null}
      {children}
      {error ? (
        <View style={styles.message}>
          <Feather name="alert-circle" size={13} color={colors.danger} />
          <Text variant="caption" tone="danger" style={styles.flex}>
            {error}
          </Text>
        </View>
      ) : hint ? (
        <Text variant="caption" tone="subtle" style={styles.hint}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    gap: 8,
  },
  label: {
    marginLeft: 4,
  },
  box: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: radius.input,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  boxMultiline: {
    alignItems: "flex-start",
    paddingVertical: 14,
    minHeight: 110,
  },
  iconTop: {
    marginTop: 2,
  },
  input: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 16,
    paddingVertical: 14,
  },
  inputMultiline: {
    paddingVertical: 0,
    minHeight: 80,
    textAlignVertical: "top",
  },
  message: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginLeft: 4,
  },
  hint: {
    marginLeft: 4,
  },
  flex: {
    flex: 1,
  },
});
