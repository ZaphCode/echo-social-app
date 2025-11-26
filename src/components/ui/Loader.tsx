import { View, Text, ActivityIndicator } from "react-native";
import React from "react";
import { theme } from "@/theme/theme";
import useColorScheme from "@/hooks/useColorScheme";

type Props = {
  size?: number;
  horizontal?: boolean;
};

export default function Loader({ size = 40, horizontal = false }: Props) {
  const { colors } = useColorScheme();
  return (
    <View
      style={{
        justifyContent: "center",
        alignItems: "center",
        gap: 7,
        flexDirection: horizontal ? "row" : "column",
      }}
    >
      <ActivityIndicator size={size} color={colors.lightGray} />
      <Text style={{ color: colors.lightGray }}>Cargando...</Text>
    </View>
  );
}
