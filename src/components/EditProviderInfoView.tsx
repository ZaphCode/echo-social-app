import { StyleSheet, View } from "react-native";

import ProviderInfoForm from "./forms/ProviderInfoForm";
import { useForm } from "react-hook-form";
import { ProviderProfile } from "@/models/ProviderProfile";
import Text from "./ui/Text";
import { theme } from "@/theme/theme";

type Props = {
  providerProfile: ProviderProfile;
};

export default function EditProviderInfoView({ providerProfile }: Props) {
  const { control, handleSubmit } = useForm({
    defaultValues: {
      description: providerProfile.description,
      available_days: providerProfile.available_days || [],
      specialty: providerProfile.specialty,
      experience_years: `${providerProfile.experience_years}`,
    },
  });

  const onContinue = handleSubmit(async (data) => {
    console.log("Submitting provider info:", data);
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
