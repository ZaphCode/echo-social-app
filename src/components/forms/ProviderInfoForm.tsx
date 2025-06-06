import { View, Text } from "react-native";

import { theme } from "@/theme/theme";
import { validYearsRules } from "@/utils/validations";
import Field from "./Field";
import Dropdown from "./Dropdown";
import Button from "../ui/Button";
import WeekDaysPicker from "./WeekdaysPicker";
import useList from "@/hooks/useList";

type Props = {
  control: any;
  submitBtnLabel: string;
  onContinue: () => void;
};

export default function ProviderInfoForm({
  control,
  onContinue,
  submitBtnLabel,
}: Props) {
  const [categories, { status }] = useList("service_category", {});

  return (
    <View style={{ gap: theme.spacing.md }}>
      <Field
        name="description"
        control={control}
        icon="info"
        label="Descripción personal"
        placeholder="Escribe una breve descripción"
      />
      {status === "loading" ? (
        <Text>Loading categories...</Text>
      ) : status === "error" ? (
        <Text>Error loading categories</Text>
      ) : (
        <Dropdown
          control={control}
          name="specialty"
          icon="tag"
          label="Especialidad"
          options={categories}
          getLabel={(c) => c.name}
          getValue={(c) => c.id}
        />
      )}
      <Field
        name="experience_years"
        control={control}
        label="Años de experiencia"
        icon="calendar"
        placeholder="Ej: 5"
        rules={validYearsRules}
      />
      <WeekDaysPicker
        control={control}
        name="available_days"
        label="Días disponibles"
        rules={{ required: "Selecciona al menos un día" }}
      />
      <Button
        title={submitBtnLabel}
        loading={status === "loading"}
        onPress={onContinue}
        style={{ marginTop: 2 }}
      />
    </View>
  );
}
