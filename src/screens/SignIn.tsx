import { View, StyleSheet, Alert, Pressable } from "react-native";
import { Image } from "expo-image";
import { useForm } from "react-hook-form";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { theme } from "@/theme/theme";
import { validEmailRules } from "@/utils/validations";
import Text from "@/components/ui/Text";
import Field from "@/components/ui/Field";
import Button from "@/components/ui/Button";
import useRedirect from "@/hooks/auth/useRedirect";
import useLogin from "@/hooks/auth/useLogin";

export default function SignIn() {
  useRedirect();

  const { login, loginError } = useLogin();
  const navigation = useNavigation();

  const { control, handleSubmit } = useForm({
    defaultValues: {
      email: "zaph@fapi.com",
      password: "menosfapi33",
    },
  });

  const onSubmit = handleSubmit(async ({ email, password }) => {
    console.log("Submitting login with:", { email, password });

    await login(email, password);

    if (loginError) Alert.alert("Error", loginError, [{ text: "OK" }]);
  });

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <Image
          source={require("@Assets/app-logo.png")}
          contentFit="contain"
          style={{ width: 120, height: 120 }}
        />
      </View>
      <View style={{ gap: 5, alignItems: "center" }}>
        <Text fontFamily="bold" color="white" size={theme.fontSizes.xl + 5}>
          Bienvenido de Vuelta
        </Text>
        <Text size={theme.fontSizes.lg}>Inicia sesión para continuar</Text>
      </View>
      <View style={{ width: "90%", gap: 20, paddingVertical: 30 }}>
        <Field
          name="email"
          label="Correo"
          control={control}
          placeholder="Email"
          icon="mail"
          keyboardType="email-address"
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
        <Button
          title="Iniciar sesión"
          style={{ marginTop: 10 }}
          onPress={onSubmit}
        />
      </View>
      <View style={styles.createAccountView}>
        <Text>¿Aún no tienes cuenta?</Text>
        <Pressable
          onPress={() => navigation.navigate("Auth", { screen: "SignUp" })}
        >
          <Text
            style={styles.createAccountText}
            color={theme.colors.primaryBlue}
          >
            Crea una
          </Text>
        </Pressable>
      </View>
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
  createAccountView: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
  },
  createAccountText: {
    textDecorationLine: "underline",
  },
});
