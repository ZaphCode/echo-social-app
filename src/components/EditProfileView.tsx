import { useForm } from "react-hook-form";
import { StyleSheet, View } from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  profilesKeys,
  updateClientProfile,
  updateProviderProfile,
} from "@/api/profiles";
import { ClientProfile } from "@/models/ClientProfile";
import { ProviderProfile } from "@/models/ProviderProfile";
import { theme } from "@/theme/theme";
import { User } from "@/models/User";
import { useAlertCtx } from "@/context/Alert";
import Text from "./ui/Text";
import ProfileForm from "./forms/ProfileForm";
import useColorScheme from "@/hooks/useColorScheme";

type Props = {
  userRole: User["role"];
  profile: ClientProfile | ProviderProfile;
  onSuccess?: (profile: ClientProfile | ProviderProfile) => void;
};

export default function EditProfileView({
  profile,
  userRole,
  onSuccess,
}: Props) {
  const { show } = useAlertCtx();
  const { colors } = useColorScheme();
  const queryClient = useQueryClient();
  const { control, handleSubmit } = useForm({
    defaultValues: {
      phone: profile.phone,
      address: profile.address,
      state: profile.state,
      city: profile.city,
      zip: profile.zip,
    },
  });

  const profileMutation = useMutation({
    mutationFn: (data: typeof profile) =>
      userRole === "client"
        ? updateClientProfile(profile.id, data as Partial<ClientProfile>)
        : updateProviderProfile(profile.id, data as Partial<ProviderProfile>),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profilesKeys.all });
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      const result = await profileMutation.mutateAsync({ ...data } as typeof profile);
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
    <View>
      <Text fontFamily="bold" style={styles.title} color={colors.text}>
        Editar Datos Personales
      </Text>
      <ProfileForm
        control={control}
        loading={profileMutation.isPending}
        onContinue={onSubmit}
        submitBtnLabel="Guardar Cambios"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: theme.fontSizes.xl,
    marginBottom: 16,
    textAlign: "center",
    paddingVertical: theme.spacing.md,
  },
});
