import { View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

import Text from "@/components/ui/Text";
import { theme } from "@/theme/theme";
import useColorScheme from "@/hooks/useColorScheme";

interface Props {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: string | number;
}

export default function InfoRow({ icon, label, value }: Props) {
  const { colors } = useColorScheme();
  return (
    <View>
      <View style={styles.labelContainer}>
        <Feather name={icon} size={20} color={colors.text} />
        <Text style={styles.label} color={colors.text}>
          {label}
        </Text>
      </View>
      <Text color={colors.lightGray} style={styles.value}>
        {`${value}`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  labelContainer: { flexDirection: "row", alignItems: "center", gap: 8 },
  label: { fontSize: theme.fontSizes.md },
  value: { fontSize: theme.fontSizes.md, marginLeft: 28, marginTop: 5 },
});
