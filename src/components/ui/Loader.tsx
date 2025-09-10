import { View, Text, ActivityIndicator } from "react-native";
import React from "react";
import { theme } from "@/theme/theme";

type Props = {
  size?: number;
  horizontal?: boolean;
};

export default function Loader({ size = 40, horizontal = false }: Props) {
  return (
    <View
      style={{
        justifyContent: "center",
        alignItems: "center",
        gap: 7,
        flexDirection: horizontal ? "row" : "column",
      }}
    >
      <ActivityIndicator size={size} color={theme.colors.lightGray} />
      <Text style={{ color: theme.colors.lightGray }}>Cargando...</Text>
    </View>
  );
}
