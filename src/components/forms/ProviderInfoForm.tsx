import { StyleSheet, View } from "react-native";
import { Control } from "react-hook-form";

import useCategories from "@/hooks/useCategories";
import { validYearsRules } from "@/utils/validations";
import Button from "../ui/Button";
import Dropdown from "./Dropdown";
import Field from "./Field";
import WeekDaysPicker from "./WeekdaysPicker";

type Props = {
  control: Control<any>;
  submitBtnLabel: string;
  loading?: boolean;
  onContinue: () => void;
};

export default function ProviderInfoForm({ control, onContinue, submitBtnLabel, loading }: Props) {
  const { categories, isPending } = useCategories();

  return (
    <View style={styles.fields}>
      <Dropdown
        control={control}
        name="specialty"
        icon="tag"
        label="Especialidad"
        loading={isPending}
        options={categories}
        getLabel={(category) => category.name}
        getValue={(category) => category.id}
      />
      <Field
        name="experience_years"
        control={control}
        label="Años de experiencia"
        icon="award"
        placeholder="Ej. 5"
        keyboardType="numeric"
        rules={validYearsRules}
      />
      <Field
        name="description"
        control={control}
        label="Sobre ti"
        placeholder="Cuéntales a tus clientes en qué eres bueno"
        autoCapitalize="sentences"
        multiline
      />
      <WeekDaysPicker
        control={control}
        name="available_days"
        label="Días disponibles"
        rules={{ required: "Selecciona al menos un día" }}
      />
      <Button title={submitBtnLabel} loading={loading} onPress={onContinue} style={styles.submit} />
    </View>
  );
}

const styles = StyleSheet.create({
  fields: {
    gap: 16,
  },
  submit: {
    marginTop: 8,
  },
});
