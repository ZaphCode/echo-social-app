import { StyleSheet, View } from "react-native";

import useTheme from "@/hooks/useTheme";
import { fonts } from "@/theme/theme";
import Text from "./Text";

const ARC_LEFT = "#3B8EDB";
const ARC_RIGHT = "#5CC8F0";

type ArcProps = { size: number; color: string; side: "left" | "right"; stroke: number };

/** A quarter-ish ring segment built from a bordered circle. */
function Arc({ size, color, side, stroke }: ArcProps) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: stroke,
        borderColor: "transparent",
        borderTopColor: color,
        ...(side === "left" ? { borderLeftColor: color } : { borderRightColor: color }),
        transform: [{ rotate: side === "left" ? "-20deg" : "20deg" }],
        position: "absolute",
      }}
    />
  );
}

type Props = { height?: number };

/** "echo" wordmark: the word plus its two sound arcs. */
export default function EchoMark({ height = 26 }: Props) {
  const { colors } = useTheme();
  const fontSize = height;
  const arc = height * 0.9;
  const stroke = Math.max(2, height * 0.09);

  return (
    <View
      accessibilityRole="header"
      accessibilityLabel="echo"
      style={[styles.row, { height: height * 1.25 }]}
    >
      <View style={[styles.arcBox, { width: arc * 0.5, height: arc }]}>
        <View style={{ position: "absolute", left: 0, top: height * 0.12, width: arc, height: arc }}>
          <Arc size={arc} color={ARC_LEFT} side="left" stroke={stroke} />
        </View>
      </View>
      <Text
        color={colors.text}
        style={{
          fontFamily: fonts.bold,
          fontSize,
          lineHeight: fontSize * 1.15,
          letterSpacing: -fontSize * 0.04,
        }}
      >
        echo
      </Text>
      <View style={[styles.arcBox, { width: arc * 0.5, height: arc }]}>
        <View style={{ position: "absolute", right: 0, top: height * 0.12, width: arc, height: arc }}>
          <Arc size={arc} color={ARC_RIGHT} side="right" stroke={stroke} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  arcBox: {
    overflow: "hidden",
  },
});
