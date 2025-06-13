import { StyleSheet, ScrollView } from "react-native";
import { StaticScreenProps, useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { SafeAreaView } from "react-native-safe-area-context";

import { User } from "@/models/User";
import { theme } from "@/theme/theme";
import { useAlertCtx } from "@/context/Alert";
import AvatarPicker from "@/components/forms/AvatarPicker";
import useRegister from "@/hooks/auth/useRegister";
import useRedirect from "@/hooks/auth/useRedirect";
import useLocation from "@/hooks/useLocation";
import ProfileForm from "@/components/forms/ProfileForm";

type Props = StaticScreenProps<{
  userData: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: User["role"];
    avatar?: string;
  };
}>;

export default function ProfileCreation({ route }: Props) {
  useRedirect();
  const { userData } = route.params;
  const [avatar, setAvatar] = useState<string>();
  const navigation = useNavigation();
  const { show } = useAlertCtx();

  const { control, handleSubmit, setValue } = useForm({
    defaultValues: {
      phone: "",
      address: "",
      state: "",
      city: "",
      zip: "",
    },
  });

  const { registerClient, loading } = useRegister();
  const { coords, address } = useLocation(true);

  useEffect(() => {
    if (address) {
      setValue("city", address.city || "");
      setValue("state", address.region || "");
      setValue("zip", address.postalCode || "");
    }
  }, [address]);

  const onContinue = handleSubmit(async (profileData) => {
    const allData = {
      ...userData,
      ...profileData,
      avatar,
      location: coords
        ? {
            lat: coords.latitude,
            lon: coords.longitude,
          }
        : undefined,
    };

    if (userData.role === "provider") {
      navigation.navigate("Auth", {
        screen: "ProviderData",
        params: { userData: allData },
      });
    } else {
      const error = await registerClient(allData);

      if (error) {
        show({
          title: "Error al crear cuenta",
          message:
            "Ocurrió un error al crear tu cuenta. Por favor, inténtalo de nuevo más tarde.",
          icon: "account-remove",
          iconColor: theme.colors.redError,
        });
      }
    }
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <AvatarPicker onChange={setAvatar} />
        <ProfileForm
          submitBtnLabel="Continuar"
          control={control}
          onContinue={onContinue}
          loading={loading}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    flex: 1,
    paddingTop: theme.spacing.tabPT,
  },
  fieldsContainer: {
    paddingHorizontal: theme.spacing.md - 2,
    gap: theme.spacing.sm - 2,
    paddingBottom: theme.spacing.lg + 24,
  },
});
