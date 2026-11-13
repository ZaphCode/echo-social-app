import { ComponentProps, ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import useTheme from "@/hooks/useTheme";
import { radius } from "@/theme/theme";
import Text from "./ui/Text";

type IconName = ComponentProps<typeof Feather>["name"];

/** Card that groups rows under a title, with an optional "Editar" action. */
export function InfoGroup({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit?: () => void;
  children: ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.group}>
      <View style={styles.groupHeader}>
        <Text variant="label" bold tone="subtle" style={styles.groupTitle}>
          {title.toUpperCase()}
        </Text>
        {onEdit ? (
          <Pressable accessibilityRole="button" accessibilityLabel={`Editar ${title}`} onPress={onEdit} hitSlop={10}>
            <Text variant="label" bold tone="accent">
              Editar
            </Text>
          </Pressable>
        ) : null}
      </View>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.line }]}>
        {children}
      </View>
    </View>
  );
}

type RowProps = {
  icon: IconName;
  label: string;
  value?: string | number;
  /** Right-side control (switch, chevron...). */
  trailing?: ReactNode;
  onPress?: () => void;
  last?: boolean;
  tone?: "default" | "danger";
};

export default function InfoRow({ icon, label, value, trailing, onPress, last, tone = "default" }: RowProps) {
  const { colors } = useTheme();
  const color = tone === "danger" ? colors.danger : colors.text;

  const content = (
    <View style={[styles.row, !last && { borderBottomColor: colors.line, borderBottomWidth: 1 }]}>
      <View style={[styles.icon, { backgroundColor: tone === "danger" ? colors.dangerSoft : colors.surface2 }]}>
        <Feather name={icon} size={17} color={tone === "danger" ? colors.danger : colors.textMuted} />
      </View>
      <View style={styles.text}>
        <Text variant={value !== undefined ? "caption" : "body"} tone={value !== undefined ? "subtle" : "default"} color={value === undefined ? color : undefined}>
          {label}
        </Text>
        {value !== undefined ? (
          <Text tone={value === "" ? "subtle" : "default"}>{value === "" ? "Sin registrar" : String(value)}</Text>
        ) : null}
      </View>
      {trailing}
      {onPress && !trailing ? <Feather name="chevron-right" size={18} color={colors.textSubtle} /> : null}
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  group: {
    gap: 8,
  },
  groupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  groupTitle: {
    letterSpacing: 0.6,
  },
  card: {
    borderRadius: radius.card,
    borderWidth: 1,
    paddingHorizontal: 14,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 60,
    paddingVertical: 10,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    flex: 1,
    minWidth: 0,
  },
});
