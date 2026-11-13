import { Pressable, StyleSheet, View } from "react-native";
import { useForm } from "react-hook-form";
import { useNavigation } from "@react-navigation/native";

import { useAlertCtx } from "@/context/Alert";
import { User } from "@/models/User";
import { supabase } from "@/lib/supabase";
import * as rules from "@/utils/validations";
import Text from "@/components/ui/Text";
import Field from "@/components/forms/Field";
import Button from "@/components/ui/Button";
import useRedirect from "@/hooks/auth/useRedirect";
import RoleSelector from "@/components/forms/RoleSelector";
import useTheme from "@/hooks/useTheme";
import AuthLayout from "@/components/AuthLayout";

export default function SignUp() {
  useRedirect();
  const { colors } = useTheme();
  const { show } = useAlertCtx();
  const navigation = useNavigation();

  const { control, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      name: __DEV__ ? "Bob bob" : "",
      email: __DEV__ ? "b@b.com" : "",
      password: __DEV__ ? "password" : "",
      confirmPassword: __DEV__ ? "password" : "",
      role: "client" as User["role"],
    },
  });

  // TODO: Move this to a separate utility file
  async function emailExists(email: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .limit(1);

      if (error) return false;
      return (data?.length ?? 0) > 0;
    } catch (err) {
      return false;
    }
  }

  const onSubmit = handleSubmit(async (data) => {
    if (await emailExists(data.email)) {
      return show({
        title: "Ese correo ya está registrado",
        message: "Inicia sesión o usa otro correo.",
        icon: "email-remove",
        iconColor: colors.danger,
      });
    }

    navigation.navigate("Auth", {
      screen: "ProfileCreation",
      params: { userData: data },
    });
  });

  return (
    <AuthLayout
      step={{ current: 1, total: watch("role") === "provider" ? 3 : 2 }}
      title="Crea tu cuenta"
      subtitle="Primero, ¿cómo vas a usar Echo?"
      footer={
        <View style={styles.footer}>
          <Text tone="muted">¿Ya tienes cuenta?</Text>
          <Pressable
            accessibilityRole="link"
            hitSlop={10}
            onPress={() => navigation.navigate("Auth", { screen: "SignIn" })}
          >
            <Text bold tone="accent">
              Inicia sesión
            </Text>
          </Pressable>
        </View>
      }
    >
      <RoleSelector value={watch("role")} onChange={(role) => setValue("role", role)} />
      <Text variant="caption" tone="subtle">
        El tipo de cuenta no se puede cambiar después.
      </Text>
      <Field
        name="name"
        label="Nombre completo"
        control={control}
        placeholder="Daniela Pérez"
        icon="user"
        autoCapitalize="words"
        rules={rules.validNameRules}
      />
      <Field
        name="email"
        label="Correo"
        control={control}
        placeholder="tu@correo.com"
        icon="mail"
        keyboardType="email-address"
        rules={rules.validEmailRules}
      />
      <Field
        name="password"
        label="Contraseña"
        control={control}
        placeholder="Mínimo 8 caracteres"
        icon="lock"
        secureTextEntry
        rules={rules.validPasswordRules}
      />
      <Field
        name="confirmPassword"
        label="Confirmar contraseña"
        control={control}
        placeholder="Repite tu contraseña"
        icon="lock"
        secureTextEntry
        rules={rules.validConfirmPasswordRules}
      />
      <Button title="Continuar" onPress={onSubmit} />
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginTop: "auto",
  },
});
