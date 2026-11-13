import { StaticScreenProps, useNavigation } from "@react-navigation/native";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  contractingsKeys,
  createContracting,
  getContractingPrivateLocation,
  updateContracting,
} from "@/api/contractings";
import { Contracting } from "@/models/Contracting";
import { useAlertCtx } from "@/context/Alert";
import { useAuthCtx } from "@/context/Auth";
import { useOffline } from "@/context/Offline";
import { validPriceRules, validServicesPhotoRules } from "@/utils/validations";
import Button from "@/components/ui/Button";
import Dropdown from "@/components/forms/Dropdown";
import Field from "@/components/forms/Field";
import PhotoPicker from "@/components/forms/PhotoPicker";
import EditorLayout from "@/components/EditorLayout";
import useCategories from "@/hooks/useCategories";
import useTheme from "@/hooks/useTheme";
import useUserLocation from "@/hooks/useUserLocation";
import LocationPickerField from "@/components/forms/LocationPickerField";
import { Coords } from "@/utils/geo";

type Props = StaticScreenProps<{ contractingToEdit?: Contracting }>;

export default function ContractingEditor({ route }: Props) {
  const contracting = route.params.contractingToEdit;
  const { user } = useAuthCtx();
  const { show } = useAlertCtx();
  const { isOnline } = useOffline();
  const { colors } = useTheme();
  const { coords: userCoords } = useUserLocation();
  const queryClient = useQueryClient();
  const navigation = useNavigation();
  const { categories, isPending: categoriesPending } = useCategories();
  const createContractingMutation = useMutation({
    mutationFn: createContracting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contractingsKeys.all });
    },
  });
  const updateContractingMutation = useMutation({
    mutationFn: ({
      contractingId,
      payload,
    }: {
      contractingId: string;
      payload: Parameters<typeof updateContracting>[1];
    }) => updateContracting(contractingId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contractingsKeys.all });
    },
  });

  const privateLocationQuery = useQuery({
    queryKey: contractingsKeys.privateLocation(contracting?.id ?? ""),
    queryFn: () => getContractingPrivateLocation(contracting!.id),
    enabled: !!contracting && isOnline,
  });

  const { control, handleSubmit, formState, resetField } = useForm({
    defaultValues: {
      // New requests start at the user's position; edits load the saved one.
      location: (contracting ? null : userCoords) as Coords | null,
      contractingName: contracting?.name || "",
      description: contracting?.description || "",
      category: contracting?.category || "",
      basePrice: contracting?.base_price.toString() || "",
      photos: contracting?.photos || [],
    },
  });

  // Read during render so react-hook-form subscribes to dirty state.
  const locationDirty = !!formState.dirtyFields.location;

  useEffect(() => {
    if (privateLocationQuery.data !== undefined) {
      resetField("location", { defaultValue: privateLocationQuery.data });
    }
  }, [privateLocationQuery.data]);

  // The GPS fix may arrive after the form mounted.
  useEffect(() => {
    if (!contracting && userCoords && !locationDirty) {
      resetField("location", { defaultValue: userCoords });
    }
  }, [userCoords?.lat, userCoords?.lon]);

  const onSubmit = handleSubmit(async (data) => {
    const payload = {
      // Editing: only send the location when the owner changed it, so an
      // offline edit never wipes a location it could not load.
      location:
        !contracting || locationDirty
          ? data.location
          : undefined,
      ownerId: contracting?.owner || user.id,
      name: data.contractingName,
      description: data.description,
      category: data.category,
      basePrice: parseFloat(data.basePrice),
      photos: data.photos,
    };

    try {
      if (contracting) {
        await updateContractingMutation.mutateAsync({
          contractingId: contracting.id,
          payload,
        });
      } else {
        await createContractingMutation.mutateAsync(payload);
      }
    } catch {
      show({
        title: "No se pudo guardar",
        message:
          "Ocurrió un error al guardar la contratación. Verifique los datos e intente de nuevo.",
        icon: "database-alert",
        iconColor: colors.danger,
      });
      return;
    }

    show({
      title: contracting ? "Contratación actualizada" : "¡Contratación publicada!",
      message:
        contracting && !isOnline
          ? "La contratación se guardó localmente y se sincronizará al reconectar."
          : `La contratación ha sido ${
              contracting ? "actualizada" : "creada"
            } exitosamente.`,
      icon: "check-circle",
      iconColor: colors.success,
    });
    navigation.goBack();
  });

  return (
    <EditorLayout
      title={contracting ? "Editar contratación" : "Nueva contratación"}
      subtitle={contracting ? contracting.name : "Los profesionales aplicarán con su cotización"}
      footer={
        <Button
          title={contracting ? "Guardar cambios" : "Publicar contratación"}
          onPress={onSubmit}
          loading={createContractingMutation.isPending || updateContractingMutation.isPending}
        />
      }
    >
      <Field
        name="contractingName"
        placeholder="Ej. Remodelar baño completo"
        control={control}
        label="¿Qué necesitas?"
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
        placeholder="8500"
        control={control}
        label="Presupuesto"
        icon="dollar-sign"
        keyboardType="numeric"
        hint="Los profesionales pueden proponer otro precio."
        rules={validPriceRules}
      />
      <Field
        name="description"
        placeholder="Describe el trabajo, medidas, materiales…"
        control={control}
        label="Descripción"
        autoCapitalize="sentences"
        multiline
      />
      <PhotoPicker
        control={control}
        name="photos"
        label="Fotos de referencia"
        rules={validServicesPhotoRules}
      />
      <LocationPickerField
        control={control}
        name="location"
        disabled={!!contracting && (!isOnline || privateLocationQuery.isPending)}
      />
    </EditorLayout>
  );
}
