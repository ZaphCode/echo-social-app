import { View, Alert, StyleSheet } from "react-native";
import { useEffect } from "react";
import useColorScheme from "@/hooks/useColorScheme";
import { theme } from "@/theme/theme";
import Text from "@/components/ui/Text";
import { Feather } from "@expo/vector-icons";
import Button from "@/components/ui/Button";
import Field from "@/components/forms/Field";
import { useForm } from "react-hook-form";
import { validUrlRules } from "@/utils/validations";
import { pb } from "@/lib/pocketbase";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";

export default function ChangeApi() {
  const { colors } = useColorScheme();

  const queryClient = useQueryClient();
  const navigation = useNavigation();

  const { control, handleSubmit } = useForm({
    defaultValues: {
      apiUrl: "",
    },
  });

  const onSubmit = handleSubmit(({ apiUrl }) => {
    pb.settings.client.baseURL = apiUrl;
    queryClient.refetchQueries();
    navigation.navigate("Main");
    Alert.alert("URL de API guardada", `Nueva URL: ${apiUrl}`);
  });

  useEffect(() => {
    Alert.alert(
      "El servidor está caído",
      "Probablemente el enlace a la api esté roto en tu dispositivo o el servidor esté inactivo.\nSerá necesario que ingreses un enlace válido a la API para conectarte a nuestros servicios.\nPuedes pedirle a un desarrollador de Echo un nuevo enlace activo.",
      [{ text: "Entendido" }]
    );
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Feather
        name="settings"
        size={54}
        color={theme.colors.primaryBlue}
        style={{ alignSelf: "center", marginBottom: 10 }}
      />
      <Text color={colors.text} style={styles.title}>
        Configuración de API
      </Text>
      <Field
        name="apiUrl"
        control={control}
        label="Introduzca el nuevo enlace url de la API para conectarse al servidor"
        placeholder="https://api.ejemplo.com"
        rules={validUrlRules}
      />
      <View style={{ marginTop: 20 }}>
        <Button style={styles.button} title={"Guardar"} onPress={onSubmit} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 150,
    gap: 20,
  },
  title: {
    textAlign: "center",
    fontSize: theme.fontSizes.xxl,
    fontFamily: theme.fontFamily.bold,
  },
  button: {
    width: "80%",
    marginHorizontal: "auto",
  },
});
