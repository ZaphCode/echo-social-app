import { View, Text } from "react-native";
import React from "react";
import Field from "./ui/Field";

export default function Search() {
  return (
    <View>
      <Field
        name="search"
        label="Buscar"
        placeholder="Buscar..."
        icon="search"
        secureTextEntry={false}
        keyboardType="default"
        rules={{ required: "Este campo es requerido" }}
        control={{}}
      />
    </View>
  );
}
