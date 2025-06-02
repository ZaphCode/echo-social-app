import { View, Text, Modal, StyleSheet } from "react-native";
import React from "react";
import { theme } from "@/theme/theme";
import Button from "./Button";

type Props = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export default function AlertModal({ visible, children, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {children}
          <Button style={styles.button} onPress={onClose} title="Cerrar" />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    padding: theme.spacing.md,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    width: "90%",
    backgroundColor: theme.colors.darkerGray,
    padding: theme.spacing.lg + 4,
    gap: theme.spacing.sm,
    borderRadius: theme.spacing.sm,
    elevation: 5,
    alignItems: "center",
  },
  button: {
    minWidth: "100%",
  },
});
