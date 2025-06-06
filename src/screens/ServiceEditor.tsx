import { Alert, KeyboardAvoidingView, StyleSheet, View } from "react-native";
import { useForm } from "react-hook-form";
import { StaticScreenProps } from "@react-navigation/native";
import { useEffect } from "react";

import { theme } from "@/theme/theme";
import { Service } from "@/models/Service";
import Text from "@/components/ui/Text";
import Field from "@/components/forms/Field";
import useList from "@/hooks/useList";
import Dropdown from "@/components/forms/Dropdown";
import Button from "@/components/ui/Button";
import PhotoPicker from "@/components/forms/PhotoPicker";
import useMutate from "@/hooks/useMutate";
import { validPriceRules } from "@/utils/validations";
import { useAuthCtx } from "@/context/Auth";

type Props = StaticScreenProps<{ serviceToEdit?: Service }>;

export default function ServiceEditor({ route }: Props) {
  let service = route.params.serviceToEdit;

  const { user } = useAuthCtx();
  const [categories, { status }] = useList("service_category", {});
  const { create, update, mutationState } = useMutate("service");

  const { control, handleSubmit, formState } = useForm({
    defaultValues: {
      serviceName: service?.name || "",
      description: service?.description || "",
      category: service?.category || "",
      basePrice: service?.base_price.toString() || "",
      photos: service?.photos || [],
    },
  });

  // TODO: Improve this logic
  useEffect(() => {
    if (mutationState.status === "success") {
      Alert.alert(
        "Éxito",
        service ? "Servicio actualizado" : "Servicio creado"
      );
    } else if (mutationState.status === "error") {
      Alert.alert("Error", mutationState.error || "Ocurrió un error");
    }
  }, [mutationState]);

  const onSubmit = handleSubmit(async (data) => {
    const formData = new FormData();

    formData.append("name", data.serviceName);
    formData.append("description", data.description);
    formData.append("category", data.category);
    formData.append("base_price", data.basePrice);

    for (const img of data.photos) {
      if (img.startsWith("file://")) {
        formData.append("photos", {
          uri: img,
          type: "image/jpeg",
          name: img.split("/").pop() || `photo_${Date.now()}.jpg`,
        });
      } else {
        formData.append("photos", img);
      }
    }

    if (service) {
      await update(service.id, formData);
    } else {
      formData.append("provider", user.id);
      await create(formData);
    }
  });

  return (
    <KeyboardAvoidingView style={styles.container}>
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
          keyboardType="numeric"
          rules={validPriceRules}
        />
        {/* // TODO: IMPROVE THIS SHIT  */}
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
        <PhotoPicker
          service={service}
          control={control}
          name="photos"
          rules={{
            // TODO: MOVE TO VALIDATIONS FILE
            validate: (value) => {
              if (!value || value.length === 0)
                return "Agrega al menos una foto";
              if (value.length > 5) return "Máximo 5 fotos permitidas";
              return true;
            },
          }}
        />
      </View>
      <Button
        title={service ? "Actualizar" : "Crear"}
        onPress={onSubmit}
        loading={mutationState.status === "loading"}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.sm + 4,
    paddingVertical: theme.spacing.md,
    flex: 1,
  },
});
