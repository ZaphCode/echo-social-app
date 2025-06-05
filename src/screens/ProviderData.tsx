import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { StaticScreenProps } from "@react-navigation/native";
import * as Location from "expo-location";

import { User } from "@/models/User";
import { theme } from "@/theme/theme";
import { SafeAreaView } from "react-native-safe-area-context";

import AvatarPicker from "@/components/AvatarPicker";
import { set, useForm } from "react-hook-form";
import Button from "@/components/ui/Button";
import { useEffect, useState } from "react";
import Field from "@/components/ui/Field";
import Divider from "@/components/ui/Divider";
import useRegister from "@/hooks/auth/useRegister";
import WeekDaysPicker from "@/components/WeekdaysPicker";
import Text from "@/components/ui/Text";
import { Feather } from "@expo/vector-icons";

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
    zipCode: string;
    location?: { lat: number; lon: number };
  };
}>;

export default function ProviderData({ route }: Props) {
  const { userData } = route.params;

  const { control, handleSubmit, setValue } = useForm({
    defaultValues: {
      description: "",
      available_days: [] as string[],
      experience_years: "",
    },
  });

  const { registerProvider } = useRegister();

  const onContinue = handleSubmit(async (data) => {
    const error = await registerProvider({
      ...userData,
      ...data,
      experience_years: parseInt(data.experience_years),
    });

    if (error) {
      Alert.alert(
        "Error",
        "No se pudo registrar el proveedor. Inténtalo de nuevo."
      );
    } else {
      Alert.alert("Éxito", "Proveedor registrado correctamente.");
    }
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.fieldsContainer}>
          <View style={styles.headerContainer}>
            <Feather
              name="briefcase"
              size={44}
              color={theme.colors.primaryBlue}
              style={{ marginBottom: 6 }}
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
          <Field
            name="experience_years"
            control={control}
            label="Años de experiencia"
            placeholder="Ej: 5"
          />
          <WeekDaysPicker
            control={control}
            name="available_days"
            label="Días disponibles"
            rules={{ required: "Selecciona al menos un día" }}
          />
          <Button
            title="Registrar"
            onPress={onContinue}
            style={{ marginTop: 2 }}
          />
        </View>
      </ScrollView>
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
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.lg + 24,
  },
  headerContainer: {
    marginBottom: theme.spacing.sm,
    alignItems: "center",
    paddingTop: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  headerMsg: {
    color: theme.colors.lightGray,
    textAlign: "center",
    paddingHorizontal: theme.spacing.sm,
  },
});
