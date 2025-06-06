import React, { FC, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { Controller, RegisterOptions } from "react-hook-form";
import { Feather } from "@expo/vector-icons";
import { theme } from "@/theme/theme";

interface Props<T = any> {
  name: string;
  label?: string;
  control: any;
  options: T[];
  getLabel: (option: T) => string;
  getValue: (option: T) => string | number;
  rules?: RegisterOptions;
  defaultValue?: string | number;
  zIndex?: number;
  icon?: keyof typeof Feather.glyphMap;
  iconColor?: string;
}

const Dropdown: FC<Props> = ({
  name,
  label,
  control,
  options,
  getLabel,
  getValue,
  rules,
  defaultValue,
  zIndex = 1000,
  icon,
  iconColor,
}) => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(
    options.map((opt) => ({
      label: getLabel(opt),
      value: getValue(opt),
    }))
  );

  return (
    <Controller
      control={control}
      name={name}
      rules={rules || { required: "Este campo es requerido" }}
      defaultValue={defaultValue || null}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <View style={{ zIndex }}>
          {label && <Text style={styles.label}>{label}</Text>}
          <View style={styles.inputContainer}>
            {icon && (
              <Feather
                name={icon}
                size={20}
                color={iconColor || theme.colors.lightGray}
                style={styles.icon}
              />
            )}
            <View style={{ flex: 1 }}>
              <DropDownPicker
                open={open}
                setOpen={setOpen}
                value={value}
                setValue={onChange}
                items={items}
                setItems={setItems}
                placeholder="Selecciona una opción..."
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
                textStyle={styles.dropdownText}
                placeholderStyle={styles.placeholder}
                listItemLabelStyle={styles.dropdownText}
                theme="DARK"
                autoScroll
                onChangeValue={(val) => onChange(val)}
              />
            </View>
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
    paddingVertical: 4.5,
  },
  icon: {
    marginRight: 10,
  },
  dropdown: {
    backgroundColor: theme.colors.darkGray,
    borderWidth: 0,
    borderRadius: 12,
    minHeight: 44,
  },
  dropdownContainer: {
    backgroundColor: theme.colors.darkGray,
    borderRadius: 12,
    borderWidth: 0,
  },
  dropdownText: {
    color: "#fff",
    fontSize: theme.fontSizes.md,
    fontFamily: theme.fontFamily.regular,
  },
  placeholder: {
    color: theme.colors.lightGray,
  },
  error: {
    color: theme.colors.redError,
    marginTop: theme.spacing.sm,
    fontSize: theme.fontSizes.sm,
  },
});

export default Dropdown;
