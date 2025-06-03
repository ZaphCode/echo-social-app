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
import useSignUp from "@/hooks/auth/useSignUp";
import { useState } from "react";

type FormData = {
  nombre: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function SignUp() {
  useRedirect();
  const [selectedRole, setSelectedRole] = useState<"client" | "provider">("client");
  const { signUp, signUpError, loading } = useSignUp();
  const navigation = useNavigation();

  const { control, handleSubmit, getValues, formState: { errors, isValid } } = useForm<FormData>({
    defaultValues: {
      nombre: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const onSubmit = async (data: FormData) => {
    if (data.password !== data.confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden");
      return;
    }

    const success = await signUp({
      name: data.nombre,
      email: data.email,
      password: data.password,
      passwordConfirm: data.confirmPassword,
      role: selectedRole,
    });

    if (!success && signUpError) {
      Alert.alert("Error", signUpError);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View>
          <Image
            source={require("@Assets/app-logo.png")}
            contentFit="contain"
            style={{ width: 120, height: 120 }}
          />
        </View>

        <View style={styles.headerContainer}>
          <Text fontFamily="bold" color="white" size={theme.fontSizes.xl + 5}>
            Regístrate Ahora
          </Text>
        </View>

        <View style={styles.roleButtonContainer}>
          <Pressable
            style={[
              styles.roleButton,
              selectedRole === "client" && styles.selectedRoleButton,
            ]}
            onPress={() => setSelectedRole("client")}
          >
            <Text 
              style={[
                styles.roleButtonText,
                selectedRole === "client" && styles.selectedRoleButtonText,
              ]}
            >
              Cliente
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.roleButton,
              selectedRole === "provider" && styles.selectedRoleButton,
            ]}
            onPress={() => setSelectedRole("provider")}
          >
            <Text 
              style={[
                styles.roleButtonText,
                selectedRole === "provider" && styles.selectedRoleButtonText,
              ]}
            >
              Prestador de Servicio
            </Text>
          </Pressable>
        </View>

        <View style={styles.formContainer}>
          <Field
            name="nombre"
            label="Nombre"
            control={control}
            placeholder="Nombre"
            icon="user"
            keyboardType="default"
            rules={{
              required: "El nombre es requerido",
              minLength: {
                value: 2,
                message: "El nombre debe tener al menos 2 caracteres",
              },
            }}
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
            rules={{
              required: "La contraseña es requerida",
              minLength: {
                value: 8,
                message: "La contraseña debe tener al menos 8 caracteres",
              },
            }}
          />
          <Field
            name="confirmPassword"
            label="Confirmar contraseña"
            control={control}
            placeholder="*****"
            icon="lock"
            secureTextEntry={true}
            rules={{
              required: "Debes confirmar tu contraseña",
              validate: (value) => 
                value === getValues("password") || "Las contraseñas no coinciden",
            }}
          />
          <Button
            title="Continuar"
            style={{ marginTop: 10 }}
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            disabled={loading || !isValid}
          />
        </View>

        <View style={styles.loginAccountView}>
          <Text>¿Ya tienes una cuenta?</Text>
          <Pressable
            onPress={() => {
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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingTop: 20,
  },
  headerContainer: {
    gap: 5,
    alignItems: "center",
    marginTop: 10,
  },
  roleButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
    marginTop: 20,
    marginBottom: 10,
  },
  roleButton: {
    flex: 1,
    borderRadius: 12,
    marginHorizontal: 5,
    padding: 12,
    backgroundColor: theme.colors.darkGray,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedRoleButton: {
    backgroundColor: theme.colors.primaryBlue,
  },
  roleButtonText: {
    color: theme.colors.lightGray,
    fontSize: theme.fontSizes.md - 2,
    fontWeight: "600",
    textAlign: "center",
  },
  selectedRoleButtonText: {
    color: theme.colors.lightGray,
  },
  formContainer: {
    width: "90%",
    gap: 20,
    paddingVertical: 20,
  },
  loginAccountView: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
    marginTop: 10,
  },
  loginAccountText: {
    textDecorationLine: "underline",
  },
});
