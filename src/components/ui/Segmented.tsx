import { Pressable, StyleSheet, View } from "react-native";

import useTheme from "@/hooks/useTheme";
import { radius } from "@/theme/theme";
import Text from "./Text";

type Option<T extends string> = { value: T; label: string; count?: number };

type Props<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: "md" | "sm";
};

/** Pill segmented control (Servicios / Contrataciones, theme picker...). */
export default function Segmented<T extends string>({
  options,
  value,
  onChange,
  size = "md",
}: Props<T>) {
  const { colors } = useTheme();
  const height = size === "md" ? 52 : 42;

  return (
    <View
      accessibilityRole="tablist"
      style={[styles.track, { backgroundColor: colors.surface, height }]}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={[
              styles.segment,
              selected && {
                backgroundColor: colors.accent,
                boxShadow: `0 6px 18px -6px ${colors.accentGlow}`,
              },
            ]}
          >
            <Text
              variant={size === "md" ? "body" : "label"}
              bold
              color={selected ? colors.onAccent : colors.textMuted}
            >
              {option.label}
            </Text>
            {option.count !== undefined && (
              <View
                style={[
                  styles.count,
                  {
                    backgroundColor: selected
                      ? "rgba(255,255,255,0.22)"
                      : colors.surface3,
                  },
                ]}
              >
                <Text
                  variant="micro"
                  bold
                  color={selected ? colors.onAccent : colors.textMuted}
                >
                  {String(option.count)}
                </Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: "row",
    borderRadius: radius.pill,
    padding: 4,
  },
  segment: {
    flex: 1,
    borderRadius: radius.pill,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  count: {
    minWidth: 22,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});
