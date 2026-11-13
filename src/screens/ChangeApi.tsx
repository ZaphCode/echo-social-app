import { StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import useTheme from "@/hooks/useTheme";
import { space } from "@/theme/theme";

/**
 * No longer needed with Supabase cloud; kept as an info screen.
 */
export default function ChangeApi() {
  const { colors } = useTheme();
  const navigation = useNavigation();

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <EmptyState
        icon="cloud"
        title="Conexión al servidor"
        message="La app está conectada a Supabase en la nube. Si tienes problemas, revisa tu conexión a internet."
      />
      <Button title="Volver" variant="secondary" onPress={() => navigation.goBack()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: space.gutter,
    gap: space.lg,
  },
});
