import { useForm } from "react-hook-form";
import { StyleSheet, View } from "react-native";

import { ClientProfile } from "@/models/ClientProfile";
import { ProviderProfile } from "@/models/ProviderProfile";
import { theme } from "@/theme/theme";
import Text from "./ui/Text";
import ProfileForm from "./forms/ProfileForm";

type Props = {
  profile: ClientProfile | ProviderProfile;
};

export default function EditProfileView({ profile }: Props) {
  const { control, handleSubmit } = useForm({
    defaultValues: {
      phone: profile.phone,
      address: profile.address,
      state: profile.state,
      city: profile.city,
      zip: profile.zip,
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    console.log("Profile data to update:", data);
  });

  return (
    <View>
      <Text fontFamily="bold" style={styles.title}>
        Editar Datos Personales
      </Text>
      <ProfileForm
        control={control}
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
