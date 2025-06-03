import React from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";

import { theme } from "@/theme/theme";
import Text from "./ui/Text";
import { SlideModal } from "./ui/SlideModal";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function PrivacyContractModal({ visible, onClose }: Props) {
  return (
    <SlideModal visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text color="white" fontFamily="bold" size={theme.fontSizes.xl}>
            Política de Privacidad
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
          <Text color="white" style={styles.section}>
            {"Última actualización: " + new Date().toLocaleDateString()}
          </Text>

          <Text color="white" style={styles.section}>
            1. Información que Recopilamos
          </Text>
          <Text color="white" style={styles.paragraph}>
            Recopilamos información que usted nos proporciona directamente, incluyendo:
          </Text>
          <Text color="white" style={styles.bulletPoint}>
            • Información de perfil (nombre, email, teléfono, dirección)
          </Text>
          <Text color="white" style={styles.bulletPoint}>
            • Información profesional (para prestadores de servicios)
          </Text>
          <Text color="white" style={styles.bulletPoint}>
            • Contenido de mensajes y comunicaciones
          </Text>

          <Text color="white" style={styles.section}>
            2. Uso de la Información
          </Text>
          <Text color="white" style={styles.paragraph}>
            Utilizamos su información para:
          </Text>
          <Text color="white" style={styles.bulletPoint}>
            • Proporcionar y mantener nuestros servicios
          </Text>
          <Text color="white" style={styles.bulletPoint}>
            • Facilitar la comunicación entre usuarios
          </Text>
          <Text color="white" style={styles.bulletPoint}>
            • Mejorar y personalizar su experiencia
          </Text>

          <Text color="white" style={styles.section}>
            3. Protección de Datos
          </Text>
          <Text color="white" style={styles.paragraph}>
            Implementamos medidas de seguridad técnicas y organizativas para proteger su información personal. Sin embargo, ningún sistema es completamente seguro, y no podemos garantizar la seguridad absoluta de su información.
          </Text>

          <Text color="white" style={styles.section}>
            4. Compartir Información
          </Text>
          <Text color="white" style={styles.paragraph}>
            No vendemos ni alquilamos su información personal a terceros. Compartimos su información solo en las siguientes circunstancias:
          </Text>
          <Text color="white" style={styles.bulletPoint}>
            • Con su consentimiento explícito
          </Text>
          <Text color="white" style={styles.bulletPoint}>
            • Para cumplir con obligaciones legales
          </Text>
          <Text color="white" style={styles.bulletPoint}>
            • Para proteger nuestros derechos y propiedad
          </Text>

          <Text color="white" style={styles.section}>
            5. Sus Derechos
          </Text>
          <Text color="white" style={styles.paragraph}>
            Usted tiene derecho a:
          </Text>
          <Text color="white" style={styles.bulletPoint}>
            • Acceder a su información personal
          </Text>
          <Text color="white" style={styles.bulletPoint}>
            • Corregir información inexacta
          </Text>
          <Text color="white" style={styles.bulletPoint}>
            • Solicitar la eliminación de sus datos
          </Text>
          <Text color="white" style={styles.bulletPoint}>
            • Oponerse al procesamiento de sus datos
          </Text>

          <Text color="white" style={styles.section}>
            6. Contacto
          </Text>
          <Text color="white" style={styles.paragraph}>
            Si tiene preguntas sobre esta política de privacidad, puede contactarnos a través de:
          </Text>
          <Text color="white" style={styles.bulletPoint}>
            • Email: privacidad@echo-app.com
          </Text>
          <Text color="white" style={styles.bulletPoint}>
            • Teléfono: +1 (555) 123-4567
          </Text>
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
  section: {
    fontSize: theme.fontSizes.lg,
    fontFamily: theme.fontFamily.bold,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  paragraph: {
    fontSize: theme.fontSizes.md,
    marginBottom: theme.spacing.sm,
    lineHeight: 22,
  },
  bulletPoint: {
    fontSize: theme.fontSizes.md,
    marginLeft: theme.spacing.md,
    marginBottom: theme.spacing.xs,
    lineHeight: 22,
  },
}); 