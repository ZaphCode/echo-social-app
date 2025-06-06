import { Alert, StyleSheet, View } from "react-native";
import { useForm } from "react-hook-form";

import { theme } from "@/theme/theme";
import { ProviderProfile } from "@/models/ProviderProfile";
import Text from "./ui/Text";
import ProviderInfoForm from "./forms/ProviderInfoForm";
import useMutate from "@/hooks/useMutate";

type Props = {
  providerProfile: ProviderProfile;
  onSuccess?: (profile: ProviderProfile) => void;
};

export default function EditProviderInfoView({
  providerProfile,
  onSuccess,
}: Props) {
  const { control, handleSubmit } = useForm({
    defaultValues: {
      description: providerProfile.description,
      available_days: providerProfile.available_days || [],
      specialty: providerProfile.specialty,
      experience_years: `${providerProfile.experience_years}`,
    },
  });

  const { update, mutationState } = useMutate("provider_profile", {
    expand: "specialty",
  });

  const onContinue = handleSubmit(async (data) => {
    const result = await update(providerProfile.id, {
      ...data,
      experience_years: parseInt(data.experience_years),
    });

    // TODO: Proper error handling
    if (mutationState.status === "error") {
      console.error("Error updating profile:", mutationState.error);
      return Alert.alert(
        "Error",
        "No se pudieron guardar los cambios. Intente nuevamente."
      );
    }

    if (!result) {
      return Alert.alert(
        "Error",
        "No se pudieron guardar los cambios. Intente nuevamente."
      );
    }

    onSuccess?.(result);
  });

  return (
    <View style={styles.container}>
      <View style={{ padding: 16 }}>
        <Text fontFamily="bold" style={styles.title}>
          Editar Perfil
        </Text>
      </View>
      <ProviderInfoForm
        control={control}
        loading={mutationState.status === "loading"}
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
    color: "white",
  },
});
