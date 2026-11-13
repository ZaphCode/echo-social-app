import { useForm } from "react-hook-form";
import { StaticScreenProps, useNavigation } from "@react-navigation/native";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createService,
  servicesKeys,
  updateService,
} from "@/api/services";
import { Service } from "@/models/Service";
import { useAuthCtx } from "@/context/Auth";
import { useAlertCtx } from "@/context/Alert";
import { useOffline } from "@/context/Offline";
import { validPriceRules, validServicesPhotoRules } from "@/utils/validations";
import EditorLayout from "@/components/EditorLayout";
import Field from "@/components/forms/Field";
import Dropdown from "@/components/forms/Dropdown";
import Button from "@/components/ui/Button";
import PhotoPicker from "@/components/forms/PhotoPicker";
import useCategories from "@/hooks/useCategories";
import useTheme from "@/hooks/useTheme";

type Props = StaticScreenProps<{ serviceToEdit?: Service }>;

export default function ServiceEditor({ route }: Props) {
  const service = route.params.serviceToEdit;
  const { user } = useAuthCtx();
  const { show } = useAlertCtx();
  const { isOnline } = useOffline();
  const { colors } = useTheme();
  const queryClient = useQueryClient();
  const navigation = useNavigation();
  const { categories, isPending: categoriesPending } = useCategories();
  const createServiceMutation = useMutation({
    mutationFn: createService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: servicesKeys.all });
    },
  });
  const updateServiceMutation = useMutation({
    mutationFn: ({
      serviceId,
      payload,
    }: {
      serviceId: string;
      payload: Parameters<typeof updateService>[1];
    }) => updateService(serviceId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: servicesKeys.all });
    },
  });

  const { control, handleSubmit } = useForm({
    defaultValues: {
      serviceName: service?.name || "",
      description: service?.description || "",
      category: service?.category || "",
      basePrice: service?.base_price.toString() || "",
      photos: service?.photos || [],
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    const payload = {
      providerId: service?.provider || user.id,
      name: data.serviceName,
      description: data.description,
      category: data.category,
      basePrice: parseFloat(data.basePrice),
      photos: data.photos,
    };

    try {
      if (service) {
        await updateServiceMutation.mutateAsync({
          serviceId: service.id,
          payload,
        });
      } else {
        await createServiceMutation.mutateAsync(payload);
      }
    } catch {
      show({
        title: "No se pudo guardar",
        message:
          "Ocurrió un error al guardar el servicio. Verifique los datos e intente de nuevo.",
        icon: "database-alert",
        iconColor: colors.danger,
      });
      return;
    }

    show({
      title: service ? "Servicio actualizado" : "¡Servicio publicado!",
      message:
        service && !isOnline
          ? "El servicio se guardó localmente y se sincronizará al reconectar."
          : `El servicio ha sido ${
              service ? "actualizado" : "creado"
            } exitosamente.`,
      icon: "check-circle",
      iconColor: colors.success,
    });
    navigation.goBack();
  });

  return (
    <EditorLayout
      title={service ? "Editar servicio" : "Nuevo servicio"}
      subtitle={service ? service.name : "Los clientes te enviarán solicitudes"}
      footer={
        <Button
          title={service ? "Guardar cambios" : "Publicar servicio"}
          onPress={onSubmit}
          loading={createServiceMutation.isPending || updateServiceMutation.isPending}
        />
      }
    >
      <PhotoPicker control={control} name="photos" rules={validServicesPhotoRules} />
      <Field
        name="serviceName"
        placeholder="Ej. Reparación de fugas y tuberías"
        control={control}
        label="Título"
        autoCapitalize="sentences"
      />
      <Dropdown
        control={control}
        name="category"
        icon="tag"
        label="Categoría"
        loading={categoriesPending}
        options={categories}
        getLabel={(c) => c.name}
        getValue={(c) => c.id}
      />
      <Field
        name="basePrice"
        placeholder="450"
        control={control}
        label="Precio base"
        icon="dollar-sign"
        keyboardType="numeric"
        hint="Es un punto de partida: el precio final se negocia en el chat."
        rules={validPriceRules}
      />
      <Field
        name="description"
        placeholder="Qué incluye, materiales, tiempos…"
        control={control}
        label="Descripción"
        autoCapitalize="sentences"
        multiline
      />
    </EditorLayout>
  );
}
