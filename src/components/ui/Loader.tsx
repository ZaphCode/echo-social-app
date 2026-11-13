import { ActivityIndicator, StyleSheet, View } from "react-native";

import useTheme from "@/hooks/useTheme";
import Text from "./Text";

type Props = {
  label?: string;
  inline?: boolean;
};

export default function Loader({ label = "Cargando…", inline = false }: Props) {
  const { colors } = useTheme();

  return (
    <View style={[styles.base, inline ? styles.inline : styles.block]}>
      <ActivityIndicator color={colors.textSubtle} />
      {label ? (
        <Text variant="label" tone="subtle">
          {label}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  block: {
    paddingVertical: 48,
  },
  inline: {
    flexDirection: "row",
  },
});
