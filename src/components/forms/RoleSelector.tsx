import { ComponentProps } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import useTheme from "@/hooks/useTheme";
import { User } from "@/models/User";
import { radius } from "@/theme/theme";
import Text from "../ui/Text";

type Props = {
  value: User["role"];
  onChange: (role: User["role"]) => void;
};

const ROLES: {
  value: User["role"];
  title: string;
  body: string;
  icon: ComponentProps<typeof Feather>["name"];
}[] = [
  {
    value: "client",
    title: "Cliente",
    body: "Busco y contrato servicios.",
    icon: "search",
  },
  {
    value: "provider",
    title: "Profesional",
    body: "Ofrezco servicios y también contrato.",
    icon: "tool",
  },
];

export default function RoleSelector({ value, onChange }: Props) {
  const { colors } = useTheme();

  return (
    <View style={styles.list} accessibilityRole="radiogroup">
      {ROLES.map((role) => {
        const selected = role.value === value;
        return (
          <Pressable
            key={role.value}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => onChange(role.value)}
            style={[
              styles.card,
              {
                backgroundColor: selected ? colors.accentSoft : colors.surface,
                borderColor: selected ? colors.accent : colors.line,
              },
            ]}
          >
            <View
              style={[
                styles.icon,
                { backgroundColor: selected ? colors.accent : colors.surface2 },
              ]}
            >
              <Feather name={role.icon} size={20} color={selected ? colors.onAccent : colors.textMuted} />
            </View>
            <View style={styles.text}>
              <Text bold>{role.title}</Text>
              <Text variant="label" tone="muted">
                {role.body}
              </Text>
            </View>
            <View
              style={[
                styles.radio,
                { borderColor: selected ? colors.accent : colors.lineStrong },
              ]}
            >
              {selected && <View style={[styles.radioDot, { backgroundColor: colors.accent }]} />}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 10,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: radius.card,
    borderWidth: 1.5,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    flex: 1,
    gap: 2,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
