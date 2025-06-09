import { useForm } from "react-hook-form";
import { StyleSheet, View } from "react-native";

import { ClientProfile } from "@/models/ClientProfile";
import { ProviderProfile } from "@/models/ProviderProfile";
import { theme } from "@/theme/theme";
import { User } from "@/models/User";
import { useAlertCtx } from "@/context/Alert";
import Text from "./ui/Text";
import ProfileForm from "./forms/ProfileForm";
import useMutate from "@/hooks/useMutate";

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
  const { control, handleSubmit } = useForm({
    defaultValues: {
      phone: profile.phone,
      address: profile.address,
      state: profile.state,
      city: profile.city,
      zip: profile.zip,
    },
  });

  const collectionName =
    userRole === "client" ? "client_profile" : "provider_profile";

  const { update, mutationState } = useMutate(collectionName, {
    expand: "user",
  });

  const onSubmit = handleSubmit(async (data) => {
    const result = await update(profile.id, { ...data });

    if (!result || mutationState.status === "error") {
      return show({
        title: "Error al Guardar",
        message:
          "Ocurrió un error al guardar los cambios en tu perfil. Inténtalo de nuevo.",
        icon: "alert-circle",
        iconColor: theme.colors.redError,
      });
    }

    onSuccess?.(result);
  });

  return (
    <View>
      <Text fontFamily="bold" style={styles.title}>
        Editar Datos Personales
      </Text>
      <ProfileForm
        control={control}
        loading={mutationState.status === "loading"}
        onContinue={onSubmit}
        submitBtnLabel="Guardar Cambios"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    color: "white",
    fontSize: theme.fontSizes.xl,
    marginBottom: 16,
    textAlign: "center",
    paddingVertical: theme.spacing.md,
  },
});
