import { StyleSheet, View } from "react-native";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  profilesKeys,
  updateProviderProfile,
} from "@/api/profiles";
import { ProviderProfileWithCategory } from "@/api/types";
import { theme } from "@/theme/theme";
import { ProviderProfile } from "@/models/ProviderProfile";
import { useAlertCtx } from "@/context/Alert";
import Text from "./ui/Text";
import ProviderInfoForm from "./forms/ProviderInfoForm";
import useColorScheme from "@/hooks/useColorScheme";

type Props = {
  providerProfile: ProviderProfile;
  onSuccess?: (profile: ProviderProfileWithCategory) => void;
};

export default function EditProviderInfoView({
  providerProfile,
  onSuccess,
}: Props) {
  const { colors } = useColorScheme();
  const { show } = useAlertCtx();
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
      updateProviderProfile(providerProfile.id, data),
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
      onSuccess?.(result);
    } catch {
      return show({
        title: "Error al Guardar",
        message:
          "Ocurrió un error al guardar los cambios en tu perfil. Inténtalo de nuevo.",
        icon: "alert-circle",
        iconColor: colors.redError,
      });
    }
  });

  return (
    <View style={styles.container}>
      <View style={{ padding: 16 }}>
        <Text fontFamily="bold" color={colors.text} style={styles.title}>
          Editar Perfil
        </Text>
      </View>
      <ProviderInfoForm
        control={control}
        loading={providerMutation.isPending}
        onContinue={onContinue}
        submitBtnLabel="Guardar Cambios"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 32,
  },
  title: {
    fontSize: theme.fontSizes.xl,
    textAlign: "center",
  },
});
