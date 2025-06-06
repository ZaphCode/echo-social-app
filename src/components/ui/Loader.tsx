import { View, Text, ActivityIndicator } from "react-native";
import React from "react";
import { theme } from "@/theme/theme";

export default function Loader() {
  return (
    <View style={{ justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size={40} color={theme.colors.lightGray} />
      <Text style={{ color: theme.colors.lightGray, marginTop: 8 }}>
        Cargando...
      </Text>
    </View>
  );
}
