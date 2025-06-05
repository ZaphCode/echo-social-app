import { View, StyleSheet, Alert, Pressable, ScrollView } from "react-native";
import { Image } from "expo-image";
import { useForm } from "react-hook-form";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import { theme } from "@/theme/theme";
import { validEmailRules } from "@/utils/validations";
import Text from "@/components/ui/Text";
import Field from "@/components/ui/Field";
import Button from "@/components/ui/Button";
import useRedirect from "@/hooks/auth/useRedirect";
import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import RoleSelector from "@/components/RoleSelector";

export default function SignUp() {
  useRedirect();

  const navigation = useNavigation();

  const { control, handleSubmit, ...signInForm } = useForm({
    defaultValues: {
      nombre: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "client",
    },
  });

  const onSubmit = handleSubmit(async () => {
    Alert.alert("Información", "Registro exitoso", [{ text: "OK" }]);
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={{ gap: 5, alignItems: "center" }}>
          {Object.keys(signInForm.formState.errors).length === 0 && (
            <View>
              <Image
                source={require("@Assets/app-logo.png")}
                contentFit="contain"
                style={{ width: 130, height: 50, marginBottom: 10 }}
              />
            </View>
          )}
          <Text fontFamily="bold" color="white" size={theme.fontSizes.xl + 5}>
            Regístrate Ahora
          </Text>

          <RoleSelector
            onChange={(role) => signInForm.setValue("role", role)}
          />
        </View>

        <View style={{ width: "100%", gap: 20, marginTop: 20 }}>
          <Field
            name="nombre"
            label="Nombre"
            control={control}
            placeholder="Nombre"
            icon="user"
            keyboardType="default"
          />
          <Field
            name="email"
            label="Correo electrónico"
            control={control}
            placeholder="Correo electrónico"
            icon="mail"
            keyboardType="email-address"
            secureTextEntry={false}
            rules={validEmailRules}
          />
          <Field
            name="password"
            label="Contraseña"
            control={control}
            placeholder="*****"
            icon="lock"
            secureTextEntry={true}
          />
          <Field
            name="confirmPassword"
            label="Confirmar contraseña"
            control={control}
            placeholder="*****"
            icon="lock"
            secureTextEntry={true}
            rules={{
              validate: (value) =>
                value === signInForm.getValues("password") ||
                "Las contraseñas no coinciden",
            }}
          />
          <Button
            title="Continuar"
            style={{ marginTop: 10 }}
            onPress={onSubmit}
          />
        </View>
        <View style={styles.loginAccountView}>
          <Text>¿Ya tienes una cuenta?</Text>
          <Pressable
            onPress={() => {
              console.log("Navigate to SignIn");
              navigation.navigate("Auth", { screen: "SignIn" });
            }}
          >
            <Text
              style={styles.loginAccountText}
              color={theme.colors.primaryBlue}
            >
              Inicia sesión
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: theme.colors.background,
    gap: theme.spacing.sm,
    paddingTop: theme.spacing.tabPT,
  },
  loginAccountView: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
    marginTop: 30,
  },
  loginAccountText: {
    textDecorationLine: "underline",
  },
});
