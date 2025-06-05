import { View, StyleSheet, Alert } from "react-native";
import { StaticScreenProps } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useForm } from "react-hook-form";
import { Feather } from "@expo/vector-icons";

import { User } from "@/models/User";
import { theme } from "@/theme/theme";
import { validYearsRules } from "@/utils/validations";
import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import Divider from "@/components/ui/Divider";
import useRegister from "@/hooks/auth/useRegister";
import WeekDaysPicker from "@/components/WeekdaysPicker";
import Text from "@/components/ui/Text";
import Dropdown from "@/components/ui/Dropdown";
import useList from "@/hooks/useList";

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

  const { control, handleSubmit } = useForm({
    defaultValues: {
      description: "",
      available_days: [] as string[],
      specialty: "",
      experience_years: 0,
    },
  });

  const [categories, { status }] = useList("service_category", {});

  const { registerProvider, loading } = useRegister();

  const onContinue = handleSubmit(async (data) => {
    const error = await registerProvider({
      ...userData,
      ...data,
    });

    // TODO: handle error properly
    if (error) {
      Alert.alert(
        "Error",
        "No se pudo registrar el proveedor. Inténtalo de nuevo."
      );
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
          <Field
            name="description"
            control={control}
            label="Descripción personal"
            placeholder="Escribe una breve descripción"
          />
          {status === "loading" ? (
            <Text>Loading categories...</Text>
          ) : status === "error" ? (
            <Text>Error loading categories</Text>
          ) : (
            <Dropdown
              control={control}
              name="specialty"
              icon="tag"
              label="Especialidad"
              options={categories}
              getLabel={(c) => c.name}
              getValue={(c) => c.id}
            />
          )}
          <Field
            name="experience_years"
            control={control}
            label="Años de experiencia"
            placeholder="Ej: 5"
            rules={validYearsRules}
          />
          <WeekDaysPicker
            control={control}
            name="available_days"
            label="Días disponibles"
            rules={{ required: "Selecciona al menos un día" }}
          />
          <Button
            title="Registrar"
            loading={loading}
            onPress={onContinue}
            style={{ marginTop: 2 }}
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
