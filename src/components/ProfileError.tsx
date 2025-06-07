import { View, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Text from "@/components/ui/Text";
import { theme } from "@/theme/theme";

export function ProfileError({ message = "No se encontró el perfil." }) {
  return (
    <View style={errorStyles.container}>
      <MaterialCommunityIcons
        name="account-alert-outline"
        size={56}
        color={theme.colors.redError}
        style={{ marginBottom: 14 }}
      />
      <Text
        fontFamily="bold"
        size={theme.fontSizes.lg + 4}
        color={"white"}
        style={{ marginBottom: 4 }}
      >
        ¡Error al cargar perfil!
      </Text>
      <Text
        style={{ textAlign: "center" }}
        color={theme.colors.lightGray}
        size={theme.fontSizes.md}
      >
        {message}
      </Text>
    </View>
  );
}

const errorStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    paddingTop: 30,
    opacity: 0.88,
  },
});
