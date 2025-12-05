import useColorScheme from "@/hooks/useColorScheme";
import { theme } from "@/theme/theme";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import Text from "../ui/Text";
import Feather from "@expo/vector-icons/Feather";

type Props = {
  onPressCamera: () => Promise<void>;
  onPressLibrary: () => Promise<void>;
};

export default function ImageOpts({ onPressCamera, onPressLibrary }: Props) {
  const { colors } = useColorScheme();
  return (
    <View style={styles.container}>
      <Text color={colors.text} style={styles.title}>
        Agregar imagen
      </Text>
      <Text color={colors.text} style={styles.descContainer}>
        Puedes tomar una foto nueva o elegir una existente de tu galería.
      </Text>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          marginTop: theme.spacing.lg,
        }}
      >
        <TouchableOpacity
          style={[styles.buttons, { backgroundColor: colors.darkGray }]}
        >
          <Feather name="camera" size={24} color={colors.primaryBlue} />
          <Text color={colors.text} onPress={onPressCamera}>
            Cámara
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.buttons, { backgroundColor: colors.darkGray }]}
        >
          <Feather name="image" size={24} color={colors.primaryBlue} />
          <Text color={colors.text} onPress={onPressLibrary}>
            Galería
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  title: {
    fontSize: theme.fontSizes.xl,
    fontFamily: theme.fontFamily.bold,
    textAlign: "center",
  },
  descContainer: {
    gap: theme.spacing.sm,
  },
  buttons: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: theme.spacing.sm - 5,
    padding: theme.spacing.md + 5,
    borderRadius: 10,
  },
});
