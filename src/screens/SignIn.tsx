import { Pressable, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { useNavigation } from "@react-navigation/native";
import { useForm } from "react-hook-form";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Field from "@/components/forms/Field";
import Button from "@/components/ui/Button";
import EchoMark from "@/components/ui/EchoMark";
import EchoRings from "@/components/ui/EchoRings";
import { KeyboardAwareScrollView } from "@/components/ui/KeyboardAware";
import Text from "@/components/ui/Text";
import { useAlertCtx } from "@/context/Alert";
import useLogin from "@/hooks/auth/useLogin";
import useRedirect from "@/hooks/auth/useRedirect";
import useTheme from "@/hooks/useTheme";
import { getCategoryImage } from "@/theme/categoryImages";
import { space } from "@/theme/theme";
import { getDevEmail, getDevPassword } from "@/utils/constants";
import { validEmailRules } from "@/utils/validations";

/** Tiles orbiting the echo rings: [category, x%, y%, size, rotation]. */
const ORBIT: [string, number, number, number, string][] = [
  ["Plomería", 8, 18, 64, "-8deg"],
  ["Electricista", 62, 10, 72, "6deg"],
  ["Pintura", 78, 70, 60, "-5deg"],
  ["Jardinería", 4, 64, 58, "7deg"],
  ["Carpintería", 40, 100, 48, "-5deg"],
];

export default function SignIn() {
  const { show } = useAlertCtx();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { login, loading } = useLogin();
  const navigation = useNavigation();

  useRedirect();

  const { control, handleSubmit } = useForm({
    defaultValues: {
      email: __DEV__ ? getDevEmail() : "",
      password: __DEV__ ? getDevPassword() : "",
      // email: "",
      // password: ""
    },
  });

  const onSubmit = handleSubmit(async ({ email, password }) => {
    const error = await login(email, password);
    if (error) {
      show({
        title: "No pudimos iniciar sesión",
        message: getLoginErrorMessage(error),
        icon: "account-remove",
        iconColor: colors.danger,
      });
    }
  });

  return (
    <KeyboardAwareScrollView
      containerStyle={{ backgroundColor: colors.bg }}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + space.lg }]}
      showsVerticalScrollIndicator={false}
    >
        <View style={[styles.hero, { paddingTop: insets.top }]}>
          <EchoRings size={420} rings={5} style={styles.rings} />
          {ORBIT.map(([category, x, y, size, rotate]) => {
            const source = getCategoryImage(category);
            return source ? (
              <Image
                key={category}
                source={source}
                style={[
                  styles.orbit,
                  {
                    left: `${x}%`,
                    top: `${y}%`,
                    width: size,
                    height: size * 1.2,
                    borderColor: colors.bg,
                    transform: [{ rotate }],
                  },
                ]}
                contentFit="cover"
              />
            ) : null;
          })}
          <View style={[styles.mark, { backgroundColor: colors.bg, boxShadow: `0 0 60px 30px ${colors.bg}` }]}>
            <EchoMark height={40} />
          </View>
        </View>

        <View style={styles.copy}>
          <Text variant="display">Bienvenido de vuelta</Text>
          <Text tone="muted">
            Plomeros, electricistas y más profesionales de tu colonia, a un mensaje de distancia.
          </Text>
        </View>

        <View style={styles.form}>
          <Field
            name="email"
            label="Correo"
            control={control}
            placeholder="tu@correo.com"
            icon="mail"
            keyboardType="email-address"
            rules={validEmailRules}
          />
          <Field
            name="password"
            label="Contraseña"
            control={control}
            placeholder="••••••••"
            icon="lock"
            rules={{ required: "La contraseña es requerida" }}
            secureTextEntry
            onSubmitEditing={onSubmit}
          />
          <Button loading={loading} title="Ingresar" onPress={onSubmit} style={styles.submit} />
        </View>

        <View style={styles.footer}>
          <Text tone="muted">¿Aún no tienes cuenta?</Text>
          <Pressable
            accessibilityRole="link"
            hitSlop={10}
            onPress={() => navigation.navigate("Auth", { screen: "SignUp" })}
          >
            <Text bold tone="accent">
              Crea una
            </Text>
          </Pressable>
        </View>
    </KeyboardAwareScrollView>
  );
}

function getLoginErrorMessage(error: string) {
  if (error === "invalid-credentials") {
    return "Correo o contraseña incorrectos. Revísalos e intenta de nuevo.";
  }
  if (error === "offline-login-unavailable") {
    return "Sin conexión solo puedes entrar si ya iniciaste sesión antes en este dispositivo, con la misma contraseña.";
  }
  return "Ocurrió un error al iniciar sesión. Inténtalo de nuevo más tarde.";
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingHorizontal: space.gutter,
    gap: space.lg,
  },
  hero: {
    height: 300,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: -space.gutter,
    overflow: "hidden",
  },
  rings: {
    position: "absolute",
  },
  orbit: {
    position: "absolute",
    borderRadius: 18,
    borderWidth: 3,
    opacity: 0.9,
  },
  mark: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 40,
  },
  copy: {
    gap: 6,
  },
  form: {
    gap: 16,
  },
  submit: {
    marginTop: 4,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginTop: "auto",
  },
});
