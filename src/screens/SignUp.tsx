import { View, StyleSheet, Alert, Pressable, ScrollView } from "react-native";
import { Image } from "expo-image";
import { useForm } from "react-hook-form";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import { theme } from "@/theme/theme";
import { isValidEmail } from "@/utils/validations";
import Text from "@/components/ui/Text";
import Field from "@/components/ui/Field";
import Button from "@/components/ui/Button";
import useRedirect from "@/hooks/auth/useRedirect";
import useLogin from "@/hooks/auth/useLogin";

export default function SignUp() {
  useRedirect();

  const { login, loginError } = useLogin();
  const navigation = useNavigation();

  const { control, handleSubmit, getValues, formState } = useForm({
    defaultValues: {
      nombre: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async () => {
    const { email, password } = getValues();

    await login(email, password);

    if (loginError) Alert.alert("Error", loginError, [{ text: "OK" }]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={{ gap: 5, alignItems: "center", width: "100%" }}>
          {Object.keys(formState.errors).length === 0 ? (
            <View>
              <Image
                source={require("@Assets/app-logo.png")}
                contentFit="contain"
                style={{ width: 120, height: 120 }}
              />
            </View>
          ) : null}

          <Text fontFamily="bold" color="white" size={theme.fontSizes.xl + 5}>
            Regístrate Ahora
          </Text>

          <View style={styles.roleButtonContainer}>
            <Pressable
              style={styles.roleButton}
              onPress={() => console.log("Cliente")}
            >
              <Text style={styles.roleButtonText}>Cliente</Text>
            </Pressable>
            <Pressable
              style={styles.roleButton}
              onPress={() => console.log("Prestador de Servicio")}
            >
              <Text style={styles.roleButtonText}>Prestador de Servicio</Text>
            </Pressable>
          </View>
        </View>

        <View style={{ width: "90%", gap: 20, paddingVertical: 0 }}>
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
          />
          <Button
            title="Continuar"
            style={{ marginTop: 10 }}
            onPress={handleSubmit(onSubmit)}
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
  },
  roleButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
    marginTop: 10,
  },
  roleButton: {
    flex: 1,
    borderRadius: 12,
    marginHorizontal: 5,
    padding: 5,
    backgroundColor: theme.colors.darkGray,
    justifyContent: "center",
    alignItems: "center",
  },
  roleButtonText: {
    color: theme.colors.lightGray,
    fontSize: theme.fontSizes.md - 2,
    fontWeight: "600",
    textAlign: "center",
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
