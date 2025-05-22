import {
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import React, { useState } from "react";
import Text from "./ui/Text";
import { theme } from "@/theme/theme";
import Field from "./ui/Field";
import { set, useForm } from "react-hook-form";
import Button from "./ui/Button";
import DateField from "./ui/DateField";
import { useKeyboardVisible } from "@/hooks/useKeyboardVisible";

export default function RequestForm() {
  const { control, handleSubmit } = useForm({
    defaultValues: {
      price: "",
      date: "",
      notes: "",
    },
  });

  const keyboardVisible = useKeyboardVisible();
  const [offsetHeight, setOffsetHeight] = useState(0);

  const onSubmit = handleSubmit((data: any) => {
    console.log("Form data:", data);
  });

  return (
    <View style={styles.container}>
      <Text color="white" fontFamily="bold" size={theme.fontSizes.xl}>
        Solicitud de Servicio
      </Text>
      <View style={{ width: "90%", gap: theme.spacing.md }}>
        <Field
          label="Oferta inicial"
          placeholder="$0.00"
          keyboardType="numeric"
          name="price"
          icon="dollar-sign"
          onFocus={() => setOffsetHeight(10)}
          control={control}
        />
        <DateField control={control} name="date" label="Fecha" />
        <Field
          label="Notas (opcional)"
          placeholder="Especifique algo..."
          icon="edit"
          name="notes"
          onFocus={() => setOffsetHeight(220)}
          control={control}
          rules={{ required: false }}
        />
        <View style={{ height: keyboardVisible ? offsetHeight : 0 }}></View>
        <Button title="Enviar" style={{ marginTop: 12 }} onPress={onSubmit} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1, // esto permite que crezca dentro del KeyboardAvoidingView
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start", // o center, según cómo lo quieres ver
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },
});
