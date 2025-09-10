import { View, StyleSheet } from "react-native";
import { StaticScreenProps } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useForm } from "react-hook-form";
import { Feather } from "@expo/vector-icons";

import { User } from "@/models/User";
import { theme } from "@/theme/theme";
import { useAlertCtx } from "@/context/Alert";
import Divider from "@/components/ui/Divider";
import useRegister from "@/hooks/auth/useRegister";
import Text from "@/components/ui/Text";
import ProviderInfoForm from "@/components/forms/ProviderInfoForm";

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
        title: "Error de Registro",
        message:
          "Ocurrió un error al registrar tu perfil profesional. Por favor, inténtalo de nuevo más tarde.",
        icon: "alert-circle",
        iconColor: theme.colors.redError,
      });
    }
  });

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <View style={styles.fieldsContainer}>
          <View style={styles.headerContainer}>
            <Feather
              name="briefcase"
              size={44}
              color={theme.colors.primaryBlue}
            />
            <Text color="white" fontFamily="bold" size={theme.fontSizes.xl + 6}>
              ¡Ya casi terminas!
            </Text>
            <Text style={styles.headerMsg} size={theme.fontSizes.md}>
              Completa tu perfil profesional y empieza a ofrecer tus servicios.
            </Text>
            <Divider />
          </View>
          <ProviderInfoForm
            control={control}
            loading={loading}
            onContinue={onContinue}
            submitBtnLabel="Registrar"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    flex: 1,
    paddingTop: theme.spacing.tabPT,
    paddingHorizontal: theme.spacing.md,
  },
  fieldsContainer: {
    gap: theme.spacing.md - 4,
    paddingBottom: theme.spacing.lg + 24,
  },
  headerContainer: {
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  headerMsg: {
    color: theme.colors.lightGray,
    textAlign: "center",
    paddingHorizontal: theme.spacing.sm,
  },
});
