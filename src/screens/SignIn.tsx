import { View, StyleSheet, Alert, Pressable } from "react-native";
import { Image } from "expo-image";
import { useForm } from "react-hook-form";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import { theme } from "@/theme/theme";
import { validEmailRules } from "@/utils/validations";
import { getDevPassword, getDevEmail } from "@/utils/constants";
import Text from "@/components/ui/Text";
import Field from "@/components/forms/Field";
import Button from "@/components/ui/Button";
import useRedirect from "@/hooks/auth/useRedirect";
import useLogin from "@/hooks/auth/useLogin";

export default function SignIn() {
  useRedirect();

  const { login, loading } = useLogin();
  const navigation = useNavigation();

  const { control, handleSubmit } = useForm({
    defaultValues: {
      email: __DEV__ ? getDevEmail() : "",
      password: __DEV__ ? getDevPassword() : "",
    },
  });

  const onSubmit = handleSubmit(async ({ email, password }) => {
    console.log("Submitting login with:", { email, password });

    const error = await login(email, password);

    if (error) {
      // TODO: Handle error more gracefully in the future
      Alert.alert("Error", error);
    }
  });

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <Image
          source={require("@Assets/app-logo.png")}
          contentFit="contain"
          style={{ width: 130, height: 50, marginBottom: 20 }}
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
          rules={{ required: "La contraseña es requerida" }}
          secureTextEntry={true}
        />
        <Button
          loading={loading}
          title="Ingresar"
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
    paddingTop: theme.spacing.tabPT,
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
