import { KeyboardAvoidingView, StyleSheet, View } from "react-native";
import { StaticScreenProps, useNavigation } from "@react-navigation/native";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { categoriesKeys, listServiceCategories } from "@/api/categories";
import {
  contractingsKeys,
  createContracting,
  updateContracting,
} from "@/api/contractings";
import { Contracting } from "@/models/Contracting";
import { theme } from "@/theme/theme";
import { useAlertCtx } from "@/context/Alert";
import { useAuthCtx } from "@/context/Auth";
import { useOffline } from "@/context/Offline";
import { validPriceRules, validServicesPhotoRules } from "@/utils/validations";
import Button from "@/components/ui/Button";
import Dropdown from "@/components/forms/Dropdown";
import Field from "@/components/forms/Field";
import PhotoPicker from "@/components/forms/PhotoPicker";
import Text from "@/components/ui/Text";
import useColorScheme from "@/hooks/useColorScheme";

type Props = StaticScreenProps<{ contractingToEdit?: Contracting }>;

export default function ContractingEditor({ route }: Props) {
  const contracting = route.params.contractingToEdit;
  const { user } = useAuthCtx();
  const { show } = useAlertCtx();
  const { isOnline } = useOffline();
  const { colors } = useColorScheme();
  const queryClient = useQueryClient();
  const navigation = useNavigation();
  const categoriesQuery = useQuery({
    queryKey: categoriesKeys.all,
    queryFn: listServiceCategories,
  });
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

  const { control, handleSubmit } = useForm({
    defaultValues: {
      contractingName: contracting?.name || "",
      description: contracting?.description || "",
      category: contracting?.category || "",
      basePrice: contracting?.base_price.toString() || "",
      photos: contracting?.photos || [],
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    const payload = {
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
        title: "Error al Guardar",
        message:
          "Ocurrió un error al guardar la contratación. Verifique los datos e intente de nuevo.",
        icon: "database-alert",
        iconColor: theme.colors.redError,
      });
      return;
    }

    show({
      title: contracting ? "Contratación Actualizada" : "Contratación Creada",
      message:
        contracting && !isOnline
          ? "La contratación se guardó localmente y se sincronizará al reconectar."
          : `La contratación ha sido ${
              contracting ? "actualizada" : "creada"
            } exitosamente.`,
      icon: "check-circle",
      iconColor: theme.colors.successGreen,
    });
    navigation.goBack();
  });

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={{ gap: theme.spacing.md }}>
        <Field
          name="contractingName"
          placeholder="Qué necesitas contratar"
          control={control}
          label="Nombre de la Contratación"
          icon="briefcase"
        />
        <Field
          name="description"
          placeholder="Describe lo que necesitas"
          control={control}
          label="Descripción"
          icon="align-left"
        />
        <Field
          name="basePrice"
          placeholder="200"
          control={control}
          label="Presupuesto base"
          icon="dollar-sign"
          keyboardType="numeric"
          rules={validPriceRules}
        />
        {categoriesQuery.isPending ? (
          <Text>Loading categories...</Text>
        ) : categoriesQuery.isError ? (
          <Text>Error loading categories</Text>
        ) : (
          <Dropdown
            control={control}
            name="category"
            icon="tag"
            label="Categoría"
            options={categoriesQuery.data ?? []}
            getLabel={(c) => c.name}
            getValue={(c) => c.id}
            defaultValue={contracting?.category || ""}
          />
        )}
        <PhotoPicker
          service={contracting}
          control={control}
          name="photos"
          label="Fotos de referencia"
          rules={validServicesPhotoRules}
        />
      </View>
      <Button
        title={contracting ? "Actualizar" : "Crear"}
        onPress={onSubmit}
        loading={
          createContractingMutation.isPending ||
          updateContractingMutation.isPending
        }
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.sm + 4,
    paddingVertical: theme.spacing.md,
    flex: 1,
  },
});
