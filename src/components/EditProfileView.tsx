import { useForm } from "react-hook-form";
import { ScrollView, StyleSheet } from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  profilesKeys,
  updateClientProfile,
  updateProviderProfile,
} from "@/api/profiles";
import { ClientProfile } from "@/models/ClientProfile";
import { ProviderProfile } from "@/models/ProviderProfile";
import { User } from "@/models/User";
import { useAlertCtx } from "@/context/Alert";
import { useOffline } from "@/context/Offline";
import Text from "./ui/Text";
import ProfileForm from "./forms/ProfileForm";
import useTheme from "@/hooks/useTheme";

type Props = {
  userRole: User["role"];
  userId: string;
  profile: ClientProfile | ProviderProfile;
  onSuccess?: (profile: ClientProfile | ProviderProfile) => void;
};

export default function EditProfileView({
  profile,
  userId,
  userRole,
  onSuccess,
}: Props) {
  const { show } = useAlertCtx();
  const { isOnline } = useOffline();
  const { colors } = useTheme();
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
        ? updateClientProfile(profile.id, data as Partial<ClientProfile>, userId)
        : updateProviderProfile(
            profile.id,
            data as Partial<ProviderProfile>,
            userId
          ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profilesKeys.all });
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      const result = await profileMutation.mutateAsync({ ...data } as typeof profile);
      show({
        title: "Perfil Actualizado",
        message: isOnline
          ? "Tus datos se actualizaron exitosamente."
          : "Tus datos se guardaron localmente y se sincronizarán al reconectar.",
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
        Editar datos personales
      </Text>
      <ProfileForm
        control={control}
        loading={profileMutation.isPending}
        onContinue={onSubmit}
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
