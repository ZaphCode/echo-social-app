// src/components/InfoRow.tsx
import { View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import Text from "@/components/ui/Text";
import { theme } from "@/theme/theme";

interface Props {
  icon: any;
  label: string;
  value: string | number;
}

export default function InfoRow({ icon, label, value }: Props) {
  return (
    <View>
      <View style={styles.labelContainer}>
        <Feather name={icon} size={20} color={theme.colors.lightGray} />
        <Text style={styles.label}>{label}</Text>
      </View>
      <Text color="white" style={styles.value}>
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
