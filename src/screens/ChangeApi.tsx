import { View, Alert, StyleSheet } from "react-native";
import useColorScheme from "@/hooks/useColorScheme";
import { theme } from "@/theme/theme";
import Text from "@/components/ui/Text";
import { Feather } from "@expo/vector-icons";
import Button from "@/components/ui/Button";
import { useNavigation } from "@react-navigation/native";

/**
 * This screen is no longer needed with Supabase cloud.
 * Kept as a simple info screen that redirects back.
 */
export default function ChangeApi() {
  const { colors } = useColorScheme();
  const navigation = useNavigation();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Feather
        name="cloud"
        size={54}
        color={theme.colors.primaryBlue}
        style={{ alignSelf: "center", marginBottom: 10 }}
      />
      <Text color={colors.text} style={styles.title}>
        Conexión al Servidor
      </Text>
      <Text
        color={colors.text}
        style={{ textAlign: "center", fontSize: theme.fontSizes.md }}
      >
        La aplicación está conectada a Supabase en la nube. Si experimentas
        problemas de conexión, verifica tu conexión a internet.
      </Text>
      <View style={{ marginTop: 20 }}>
        <Button
          style={styles.button}
          title={"Volver"}
          onPress={() => navigation.goBack()}
        />
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
