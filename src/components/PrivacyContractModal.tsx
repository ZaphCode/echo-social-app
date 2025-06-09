import React from "react";
import { View, StyleSheet, ScrollView, Pressable, Modal, TouchableWithoutFeedback } from "react-native";
import { Feather } from "@expo/vector-icons";

import { theme } from "@/theme/theme";
import Text from "./ui/Text";
import { PRIVACY_AGREEMENT_CONTENT } from "@/utils/privacyContent";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function PrivacyContractModal({ visible, onClose }: Props) {
  const formatContent = (content: string) => {
    // Split content into lines and format appropriately
    const lines = content.split('\n');
    return lines.map((line, index) => {
      if (line.startsWith('# ')) {
        // Main title
        return (
          <Text key={index} color="white" style={styles.mainTitle}>
            {line.replace('# ', '')}
          </Text>
        );
      } else if (line.startsWith('## ')) {
        // Section title
        return (
          <Text key={index} color="white" style={styles.sectionTitle}>
            {line.replace('## ', '')}
          </Text>
        );
      } else if (line.startsWith('### ')) {
        // Subsection title
        return (
          <Text key={index} color="white" style={styles.subsectionTitle}>
            {line.replace('### ', '')}
          </Text>
        );
      } else if (line.startsWith('**') && line.endsWith('**')) {
        // Bold text
        return (
          <Text key={index} color="white" style={styles.boldText}>
            {line.replace(/\*\*/g, '')}
          </Text>
        );
      } else if (line.startsWith('- ')) {
        // Bullet point
        return (
          <Text key={index} color="white" style={styles.bulletPoint}>
            {line}
          </Text>
        );
      } else if (line.trim() === '') {
        // Empty line
        return <View key={index} style={styles.emptyLine} />;
      } else {
        // Regular paragraph
        return (
          <Text key={index} color="white" style={styles.paragraph}>
            {line}
          </Text>
        );
      }
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>
      
      <View style={styles.modalContainer}>
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
          bounces={true}
          alwaysBounceVertical={true}
        >
          {formatContent(PRIVACY_AGREEMENT_CONTENT)}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.darkerGray,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: "90%",
    minHeight: "70%",
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
  mainTitle: {
    fontSize: theme.fontSizes.xl,
    fontFamily: "Geist-Bold",
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: theme.fontSizes.lg,
    fontFamily: "Geist-Bold",
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  subsectionTitle: {
    fontSize: theme.fontSizes.md,
    fontFamily: "Geist-Bold",
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  boldText: {
    fontSize: theme.fontSizes.md,
    fontFamily: "Geist-Bold",
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
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
  emptyLine: {
    height: theme.spacing.sm,
  },
}); 