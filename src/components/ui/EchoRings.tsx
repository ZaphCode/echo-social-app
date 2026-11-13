import { StyleProp, View, ViewStyle } from "react-native";

import useTheme from "@/hooks/useTheme";

type Props = {
  size: number;
  rings?: number;
  style?: StyleProp<ViewStyle>;
};

/** Concentric echo rings: the brand motif behind sign-in, map and rating. */
export default function EchoRings({ size, rings = 4, style }: Props) {
  const { colors } = useTheme();

  return (
    <View
      pointerEvents="none"
      style={[{ width: size, height: size, alignItems: "center", justifyContent: "center" }, style]}
    >
      {Array.from({ length: rings }, (_, index) => {
        const ringSize = size * ((index + 1) / rings);
        return (
          <View
            key={index}
            style={{
              position: "absolute",
              width: ringSize,
              height: ringSize,
              borderRadius: ringSize / 2,
              borderWidth: 1,
              borderColor: colors.accent,
              opacity: 0.32 - index * (0.24 / rings),
            }}
          />
        );
      })}
    </View>
  );
}
