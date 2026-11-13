import { ComponentProps } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { Control, Controller, RegisterOptions } from "react-hook-form";
import { Feather } from "@expo/vector-icons";

import useModal from "@/hooks/useModal";
import useTheme from "@/hooks/useTheme";
import { radius } from "@/theme/theme";
import { SlideModal } from "../ui/SlideModal";
import Text from "../ui/Text";
import { FieldShell } from "./Field";

type Props<T> = {
  name: string;
  label?: string;
  control: Control<any>;
  options: T[];
  getLabel: (option: T) => string;
  getValue: (option: T) => string;
  rules?: RegisterOptions;
  placeholder?: string;
  loading?: boolean;
  icon?: ComponentProps<typeof Feather>["name"];
};

/** Select field that opens a bottom sheet list (categories, specialty...). */
export default function Dropdown<T>({
  name,
  label,
  control,
  options,
  getLabel,
  getValue,
  rules,
  placeholder = "Selecciona una opción",
  loading,
  icon,
}: Props<T>) {
  const { colors } = useTheme();
  const [visible, open, close] = useModal();

  return (
    <Controller
      control={control}
      name={name}
      rules={rules || { required: "Este campo es requerido" }}
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        const selected = options.find((option) => getValue(option) === value);
        return (
          <FieldShell label={label} error={error?.message}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={label ?? placeholder}
              onPress={open}
              disabled={loading}
              style={[
                styles.box,
                {
                  backgroundColor: colors.surface,
                  borderColor: error ? colors.danger : colors.line,
                },
              ]}
            >
              {icon && <Feather name={icon} size={18} color={colors.textSubtle} />}
              <Text tone={selected ? "default" : "subtle"} style={styles.flex} numberOfLines={1}>
                {loading ? "Cargando…" : selected ? getLabel(selected) : placeholder}
              </Text>
              <Feather name="chevron-down" size={18} color={colors.textSubtle} />
            </Pressable>

            <SlideModal visible={visible} onClose={close}>
              <Text variant="title" style={styles.sheetTitle}>
                {label ?? placeholder}
              </Text>
              <FlatList
                data={options}
                keyExtractor={(option) => getValue(option)}
                style={styles.list}
                renderItem={({ item }) => {
                  const isSelected = getValue(item) === value;
                  return (
                    <Pressable
                      accessibilityRole="radio"
                      accessibilityState={{ selected: isSelected }}
                      onPress={() => {
                        onChange(getValue(item));
                        close();
                      }}
                      style={({ pressed }) => [
                        styles.option,
                        {
                          backgroundColor: isSelected
                            ? colors.accentSoft
                            : pressed
                              ? colors.surface2
                              : "transparent",
                        },
                      ]}
                    >
                      <Text bold={isSelected} tone={isSelected ? "accent" : "default"} style={styles.flex}>
                        {getLabel(item)}
                      </Text>
                      {isSelected && <Feather name="check" size={18} color={colors.accentText} />}
                    </Pressable>
                  );
                }}
              />
            </SlideModal>
          </FieldShell>
        );
      }}
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
  sheetTitle: {
    marginBottom: 12,
  },
  list: {
    maxHeight: 440,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 50,
    paddingHorizontal: 14,
    borderRadius: radius.sm,
  },
});
