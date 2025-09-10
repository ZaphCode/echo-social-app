import { View, Text, StyleSheet } from "react-native";
import React from "react";
import Button from "../ui/Button";
import Field from "./Field";
import * as rules from "@/utils/validations";
import { theme } from "@/theme/theme";
import Divider from "../ui/Divider";
import { useForm } from "react-hook-form";

type Props = {
  submitBtnLabel: string;
  control: any;
  onContinue: () => void;
  loading?: boolean;
};

export default function ProfileForm({
  submitBtnLabel,
  control,
  onContinue,
  loading = false,
}: Props) {
  return (
    <View style={styles.fieldsContainer}>
      <Field
        name="phone"
        control={control}
        label="Teléfono"
        placeholder="+52 123 456 7890"
        keyboardType="numeric"
        rules={rules.validPhoneRules}
      />
      <Divider />
      <Field
        name="address"
        control={control}
        label="Dirección"
        placeholder="Calle Reforma, Número 123"
      />
      <Field
        name="city"
        control={control}
        label="Ciudad"
        placeholder="Ciudad de México"
      />
      <Field
        name="state"
        control={control}
        label="Estado"
        placeholder="Ciudad de México"
      />
      <Field
        name="zip"
        control={control}
        label="Código Postal"
        placeholder="12345"
        keyboardType="numeric"
        rules={rules.validZipCodeRules}
      />
      <Button
        title={submitBtnLabel}
        onPress={onContinue}
        loading={loading}
        style={{ marginTop: 18 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fieldsContainer: {
    paddingHorizontal: theme.spacing.md - 2,
    gap: theme.spacing.sm - 2,
    paddingBottom: theme.spacing.lg + 24,
  },
});
