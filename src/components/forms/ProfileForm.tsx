import { StyleSheet, View } from "react-native";
import { Control } from "react-hook-form";

import * as rules from "@/utils/validations";
import Button from "../ui/Button";
import Field from "./Field";

type Props = {
  submitBtnLabel: string;
  control: Control<any>;
  onContinue: () => void;
  loading?: boolean;
};

export default function ProfileForm({ submitBtnLabel, control, onContinue, loading = false }: Props) {
  return (
    <View style={styles.fields}>
      <Field
        name="phone"
        control={control}
        label="Teléfono"
        icon="phone"
        placeholder="+52 123 456 7890"
        keyboardType="phone-pad"
        rules={rules.validPhoneRules}
      />
      <Field
        name="address"
        control={control}
        label="Dirección"
        icon="home"
        placeholder="Calle Reforma 123"
        autoCapitalize="words"
      />
      <View style={styles.row}>
        <View style={styles.flex}>
          <Field name="city" control={control} label="Ciudad" placeholder="Mérida" autoCapitalize="words" />
        </View>
        <View style={styles.zip}>
          <Field
            name="zip"
            control={control}
            label="C.P."
            placeholder="97000"
            keyboardType="numeric"
            rules={rules.validZipCodeRules}
          />
        </View>
      </View>
      <Field name="state" control={control} label="Estado" placeholder="Yucatán" autoCapitalize="words" />
      <Button title={submitBtnLabel} onPress={onContinue} loading={loading} style={styles.submit} />
    </View>
  );
}

const styles = StyleSheet.create({
  fields: {
    gap: 16,
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  flex: {
    flex: 1,
  },
  zip: {
    width: 120,
  },
  submit: {
    marginTop: 8,
  },
});
