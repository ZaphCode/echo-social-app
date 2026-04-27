import { View, Text } from "react-native";
import { useQuery } from "@tanstack/react-query";

import { categoriesKeys, listServiceCategories } from "@/api/categories";
import { theme } from "@/theme/theme";
import { validYearsRules } from "@/utils/validations";
import Field from "./Field";
import Dropdown from "./Dropdown";
import Button from "../ui/Button";
import WeekDaysPicker from "./WeekdaysPicker";

type Props = {
  control: any;
  submitBtnLabel: string;
  loading?: boolean;
  onContinue: () => void;
};

export default function ProviderInfoForm({
  control,
  onContinue,
  submitBtnLabel,
  loading,
}: Props) {
  const categoriesQuery = useQuery({
    queryKey: categoriesKeys.all,
    queryFn: listServiceCategories,
  });

  return (
    <View style={{ gap: theme.spacing.md }}>
      <Field
        name="description"
        control={control}
        icon="info"
        label="Descripción personal"
        placeholder="Escribe una breve descripción"
      />
      {categoriesQuery.isPending ? (
        <Text>Loading categories...</Text>
      ) : categoriesQuery.isError ? (
        <Text>Error loading categories</Text>
      ) : (
        <Dropdown
          control={control}
          name="specialty"
          icon="tag"
          label="Especialidad"
          options={categoriesQuery.data ?? []}
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
        loading={categoriesQuery.isPending || loading}
        onPress={onContinue}
        style={{ marginTop: 2 }}
      />
    </View>
  );
}
