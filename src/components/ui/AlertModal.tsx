import { Modal, StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { theme } from "@/theme/theme";
import { useAlertCtx } from "@/context/Alert";
import Text from "./Text";
import Button from "./Button";

export function AlertModal() {
  const { hide, visible, icon, message, title, iconColor, onConfirm } =
    useAlertCtx();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <MaterialCommunityIcons
            name={icon}
            size={54}
            color={iconColor || theme.colors.primaryBlue}
            style={{ marginBottom: 10 }}
          />
          <Text
            fontFamily="bold"
            size={theme.fontSizes.lg}
            color="white"
            style={{ marginBottom: 4, textAlign: "center" }}
          >
            {title}
          </Text>
          <Text
            color={theme.colors.lightGray}
            size={theme.fontSizes.md}
            style={{ textAlign: "center", marginBottom: 12 }}
          >
            {message}
          </Text>
          {onConfirm ? (
            <View style={styles.buttonRow}>
              <Button
                style={{
                  width: "50%",
                  backgroundColor: theme.colors.darkGray,
                }}
                title={"Cancelar"}
                labelColor={theme.colors.lightGray}
                onPress={hide}
              />
              <Button
                style={{ width: "50%" }}
                title={"Confirmar"}
                onPress={() => {
                  onConfirm();
                  hide();
                }}
              />
            </View>
          ) : (
            <Button style={{ width: "80%" }} title="Aceptar" onPress={hide} />
          )}
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
    width: "92%",
    backgroundColor: theme.colors.darkerGray,
    padding: theme.spacing.lg + 4,
    gap: theme.spacing.sm,
    borderRadius: theme.spacing.md,
    elevation: 5,
    alignItems: "center",
  },
  button: {
    flex: 1,
    minWidth: 120,
    marginHorizontal: 6,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 10,
    marginTop: 12,
  },
});
