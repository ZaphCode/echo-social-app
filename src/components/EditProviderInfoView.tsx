import { ScrollView, StyleSheet } from "react-native";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  profilesKeys,
  updateProviderProfile,
} from "@/api/profiles";
import { ProviderProfileWithCategory } from "@/api/types";
import { ProviderProfile } from "@/models/ProviderProfile";
import { useAlertCtx } from "@/context/Alert";
import { useOffline } from "@/context/Offline";
import Text from "./ui/Text";
import ProviderInfoForm from "./forms/ProviderInfoForm";
import useTheme from "@/hooks/useTheme";

type Props = {
  providerProfile: ProviderProfile;
  userId: string;
  onSuccess?: (profile: ProviderProfileWithCategory) => void;
};

export default function EditProviderInfoView({
  providerProfile,
  userId,
  onSuccess,
}: Props) {
  const { colors } = useTheme();
  const { show } = useAlertCtx();
  const { isOnline } = useOffline();
  const queryClient = useQueryClient();
  const { control, handleSubmit } = useForm({
    defaultValues: {
      description: providerProfile.description,
      available_days: providerProfile.available_days || [],
      specialty: providerProfile.specialty,
      experience_years: `${providerProfile.experience_years}`,
    },
  });

  const providerMutation = useMutation({
    mutationFn: (data: Partial<ProviderProfile>) =>
      updateProviderProfile(providerProfile.id, data, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profilesKeys.all });
    },
  });

  const onContinue = handleSubmit(async (data) => {
    try {
      const result = await providerMutation.mutateAsync({
        ...data,
        experience_years: parseInt(data.experience_years),
      });
      show({
        title: "Perfil Actualizado",
        message: isOnline
          ? "Tu perfil profesional se actualizó exitosamente."
          : "Tu perfil profesional se guardó localmente y se sincronizará al reconectar.",
        icon: "check-circle",
        iconColor: colors.success,
      });
      onSuccess?.(result);
    } catch {
      return show({
        title: "Error al Guardar",
        message:
          "Ocurrió un error al guardar los cambios en tu perfil. Inténtalo de nuevo.",
        icon: "alert-circle",
        iconColor: colors.danger,
      });
    }
  });

  return (
    <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <Text variant="title" style={styles.title}>
        Editar perfil profesional
      </Text>
      <ProviderInfoForm
        control={control}
        loading={providerMutation.isPending}
        onContinue={onContinue}
        submitBtnLabel="Guardar cambios"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 0,
  },
  title: {
    marginBottom: 16,
  },
});
