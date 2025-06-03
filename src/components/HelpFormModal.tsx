import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Pressable, TextInput, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useForm, Controller } from "react-hook-form";

import { theme } from "@/theme/theme";
import Text from "./ui/Text";
import Button from "./ui/Button";
import { SlideModal } from "./ui/SlideModal";

type FormData = {
  subject: string;
  message: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function HelpFormModal({ visible, onClose }: Props) {
  const [sending, setSending] = useState(false);
  const { control, handleSubmit, reset } = useForm<FormData>({
    defaultValues: {
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setSending(true);
    setTimeout(() => {
      Alert.alert(
        "Mensaje Enviado",
        "Gracias por contactarnos. Te responderemos lo antes posible.",
        [{ text: "OK", onPress: () => {
          reset();
          onClose();
        }}]
      );
      setSending(false);
    }, 1000);
  };

  return (
    <SlideModal visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text color="white" fontFamily="bold" size={theme.fontSizes.xl}>
            Contactar Soporte
          </Text>
          <Pressable onPress={onClose}>
            <Feather name="x" size={24} color={theme.colors.lightGray} />
          </Pressable>
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
        >
          <Text color="white" style={styles.description}>
            ¿Necesitas ayuda? Envíanos un mensaje y te responderemos lo antes posible.
          </Text>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Asunto</Text>
              <Controller
                control={control}
                name="subject"
                rules={{ required: "El asunto es requerido" }}
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                  <>
                    <TextInput
                      style={styles.input}
                      placeholder="¿En qué podemos ayudarte?"
                      placeholderTextColor={theme.colors.lightGray}
                      value={value}
                      onChangeText={onChange}
                      maxLength={100}
                    />
                    {error && (
                      <Text style={styles.errorText}>{error.message}</Text>
                    )}
                  </>
                )}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Mensaje</Text>
              <Controller
                control={control}
                name="message"
                rules={{ 
                  required: "El mensaje es requerido",
                  minLength: {
                    value: 10,
                    message: "El mensaje debe tener al menos 10 caracteres"
                  }
                }}
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                  <>
                    <TextInput
                      style={[styles.input, styles.messageInput]}
                      placeholder="Describe tu problema o consulta..."
                      placeholderTextColor={theme.colors.lightGray}
                      value={value}
                      onChangeText={onChange}
                      multiline
                      numberOfLines={6}
                      textAlignVertical="top"
                    />
                    {error && (
                      <Text style={styles.errorText}>{error.message}</Text>
                    )}
                  </>
                )}
              />
            </View>

            <Button
              title="Enviar Mensaje"
              onPress={handleSubmit(onSubmit)}
              loading={sending}
              disabled={sending}
              style={styles.submitButton}
            />
          </View>
        </ScrollView>
      </View>
    </SlideModal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.darkerGray,
    maxHeight: '90%',
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.darkGray,
    backgroundColor: theme.colors.darkerGray,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.lg * 3,
  },
  description: {
    fontSize: theme.fontSizes.md,
    marginBottom: theme.spacing.lg,
    lineHeight: 22,
  },
  form: {
    gap: theme.spacing.lg,
  },
  inputContainer: {
    gap: theme.spacing.xs,
  },
  label: {
    color: theme.colors.lightGray,
    fontSize: theme.fontSizes.sm,
    marginLeft: theme.spacing.xs,
  },
  input: {
    backgroundColor: theme.colors.darkGray,
    borderRadius: 8,
    padding: theme.spacing.md,
    color: "white",
    fontSize: theme.fontSizes.md,
  },
  messageInput: {
    minHeight: 120,
    paddingTop: theme.spacing.md,
  },
  errorText: {
    color: theme.colors.redError,
    fontSize: theme.fontSizes.sm,
    marginLeft: theme.spacing.xs,
    marginTop: theme.spacing.xs,
  },
  submitButton: {
    marginTop: theme.spacing.md,
  },
}); 