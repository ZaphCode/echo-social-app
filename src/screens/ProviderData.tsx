import { StaticScreenProps } from "@react-navigation/native";
import { useForm } from "react-hook-form";

import { User } from "@/models/User";
import { useAlertCtx } from "@/context/Alert";
import useRegister from "@/hooks/auth/useRegister";
import ProviderInfoForm from "@/components/forms/ProviderInfoForm";
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
    phone: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    location?: { lat: number; lon: number };
  };
}>;

export default function ProviderData({ route }: Props) {
  const { userData } = route.params;
  const { colors } = useTheme();
  const { registerProvider, loading } = useRegister();
  const { show } = useAlertCtx();

  const { control, handleSubmit } = useForm({
    defaultValues: {
      description: "",
      available_days: [] as string[],
      specialty: "",
      experience_years: 0,
    },
  });

  const onContinue = handleSubmit(async (data) => {
    const error = await registerProvider({
      ...userData,
      ...data,
    });

    if (error) {
      show({
        title: "No pudimos registrar tu perfil",
        message: "Ocurrió un error. Inténtalo de nuevo más tarde.",
        icon: "alert-circle",
        iconColor: colors.danger,
      });
    }
  });

  return (
    <AuthLayout
      step={{ current: 3, total: 3 }}
      title="Tu perfil profesional"
      subtitle="Esto es lo que verán los clientes antes de enviarte una solicitud."
    >
      <ProviderInfoForm
        control={control}
        loading={loading}
        onContinue={onContinue}
        submitBtnLabel="Crear cuenta"
      />
    </AuthLayout>
  );
}
