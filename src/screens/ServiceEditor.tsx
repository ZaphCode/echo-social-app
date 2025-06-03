import { StyleSheet, View } from "react-native";
import { useForm } from "react-hook-form";
import { StaticScreenProps } from "@react-navigation/native";

import { theme } from "@/theme/theme";
import { Service } from "@/models/Service";
import Text from "@/components/ui/Text";
import Field from "@/components/ui/Field";
import useList from "@/hooks/useList";
import Dropdown from "@/components/ui/Dropdown";
import Button from "@/components/ui/Button";

type Props = StaticScreenProps<{ serviceToEdit?: Service }>;

export default function ServiceEditor({ route }: Props) {
  // const service = route.params.serviceToEdit;
  const service: Service | null = null;

  const [categories, { status }] = useList("service_category", {});

  const { control, handleSubmit } = useForm({
    defaultValues: {
      serviceName: service?.name || "",
      description: service?.description || "",
      category: service?.category || "",
      basePrice: service?.base_price.toString() || "",
    },
  });

  const onSubmit = handleSubmit((data) => {
    console.log("Form submitted with data:", data);
  });

  return (
    <View style={styles.container}>
      <View style={{ gap: theme.spacing.md }}>
        <Field
          name="serviceName"
          placeholder="Tu servicio"
          control={control}
          label="Nombre del Servicio"
          icon="award"
        />
        <Field
          name="description"
          placeholder="Descripción del servicio"
          control={control}
          label="Descripción"
          icon="align-left"
        />
        <Field
          name="basePrice"
          placeholder="200"
          control={control}
          label="Precio base"
          icon="dollar-sign"
        />
        {status === "loading" ? (
          <Text>Loading categories...</Text>
        ) : status === "error" ? (
          <Text>Error loading categories</Text>
        ) : (
          <Dropdown
            control={control}
            name="category"
            icon="tag"
            label="Categoría"
            options={categories}
            getLabel={(c) => c.name}
            getValue={(c) => c.id}
            defaultValue={service?.category || ""}
          />
        )}
      </View>
      <Button style={{ marginBlock: 30 }} title="send" onPress={onSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.sm + 4,
    flex: 1,
  },
});
