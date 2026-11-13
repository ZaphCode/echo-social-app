import { ComponentProps } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import useTheme from "@/hooks/useTheme";
import { radius, space } from "@/theme/theme";
import Text from "../ui/Text";

type Props = {
  onPressCamera: () => void | Promise<void>;
  onPressLibrary: () => void | Promise<void>;
};

export default function ImageOpts({ onPressCamera, onPressLibrary }: Props) {
  return (
    <View style={styles.container}>
      <Text variant="title">Agregar foto</Text>
      <Text tone="muted">Toma una foto nueva o elige una de tu galería.</Text>
      <View style={styles.row}>
        <Option icon="camera" label="Cámara" onPress={onPressCamera} />
        <Option icon="image" label="Galería" onPress={onPressLibrary} />
      </View>
    </View>
  );
}

function Option({
  icon,
  label,
  onPress,
}: {
  icon: ComponentProps<typeof Feather>["name"];
  label: string;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.option,
        { backgroundColor: colors.surface2, opacity: pressed ? 0.8 : 1 },
      ]}
    >
      <View style={[styles.icon, { backgroundColor: colors.accentSoft }]}>
        <Feather name={icon} size={22} color={colors.accentText} />
      </View>
      <Text bold>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: space.xs,
  },
  row: {
    flexDirection: "row",
    gap: space.sm,
    marginTop: space.sm,
  },
  option: {
    flex: 1,
    alignItems: "center",
    gap: 10,
    paddingVertical: space.lg,
    borderRadius: radius.card,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
});
