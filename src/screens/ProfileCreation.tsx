import { StaticScreenProps, useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { User } from "@/models/User";
import { useAlertCtx } from "@/context/Alert";
import AvatarPicker from "@/components/forms/AvatarPicker";
import useRegister from "@/hooks/auth/useRegister";
import useRedirect from "@/hooks/auth/useRedirect";
import useLocation from "@/hooks/useLocation";
import ProfileForm from "@/components/forms/ProfileForm";
import useTheme from "@/hooks/useTheme";
import AuthLayout from "@/components/AuthLayout";

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
  const { colors } = useTheme();
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
          title: "No pudimos crear tu cuenta",
          message: "Ocurrió un error. Inténtalo de nuevo más tarde.",
          icon: "account-remove",
          iconColor: colors.danger,
        });
      }
    }
  });

  const isProvider = userData.role === "provider";

  return (
    <AuthLayout
      step={{ current: 2, total: isProvider ? 3 : 2 }}
      title="Tus datos de contacto"
      subtitle="Solo se comparten con quien negocies. Detectamos tu ciudad si diste permiso de ubicación."
    >
      <AvatarPicker onChange={setAvatar} />
      <ProfileForm
        submitBtnLabel={isProvider ? "Continuar" : "Crear cuenta"}
        control={control}
        onContinue={onContinue}
        loading={loading}
      />
    </AuthLayout>
  );
}
