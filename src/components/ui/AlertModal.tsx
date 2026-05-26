import { useEffect, useState } from "react";
import { Modal, StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { theme } from "@/theme/theme";
import { useAlertCtx } from "@/context/Alert";
import Text from "./Text";
import Button from "./Button";
import useColorScheme from "@/hooks/useColorScheme";

export function AlertModal() {
  const { hide, visible, icon, message, title, iconColor, onConfirm } =
    useAlertCtx();
  const { colors } = useColorScheme();
  const [confirming, setConfirming] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setConfirming(false);
      setErrorMessage(null);
    }
  }, [visible]);

  const handleConfirm = async () => {
    if (!onConfirm || confirming) return;

    setConfirming(true);
    setErrorMessage(null);

    try {
      await onConfirm();
      hide();
    } catch (error) {
      setErrorMessage(getConfirmErrorMessage(error));
    } finally {
      setConfirming(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={{ ...styles.modal, backgroundColor: colors.darkerGray }}>
          <MaterialCommunityIcons
            name={icon}
            size={54}
            color={iconColor || theme.colors.primaryBlue}
            style={{ marginBottom: 10 }}
          />
          <Text
            fontFamily="bold"
            size={theme.fontSizes.lg}
            color={colors.text}
            style={{ marginBottom: 4, textAlign: "center" }}
          >
            {title}
          </Text>
          <Text
            color={colors.lightGray}
            size={theme.fontSizes.md}
            style={{ textAlign: "center", marginBottom: 12 }}
          >
            {message}
          </Text>
          {errorMessage ? (
            <Text
              color={colors.redError}
              size={theme.fontSizes.sm}
              style={styles.errorText}
            >
              {errorMessage}
            </Text>
          ) : null}
          {onConfirm ? (
            <View style={styles.buttonRow}>
              <Button
                style={{
                  width: "50%",
                  backgroundColor: colors.darkGray,
                }}
                title={"Cancelar"}
                labelColor={colors.lightGray}
                disabled={confirming}
                onPress={hide}
              />
              <Button
                style={{ width: "50%" }}
                title={"Confirmar"}
                loading={confirming}
                onPress={handleConfirm}
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

function getConfirmErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    const normalizedMessage = error.message.toLowerCase();

    if (
      normalizedMessage.includes("network") ||
      normalizedMessage.includes("fetch") ||
      normalizedMessage.includes("offline")
    ) {
      return "No pudimos completar la acción porque no hay conexión. Intenta nuevamente cuando vuelvas a estar en línea.";
    }

    return error.message;
  }

  return "No pudimos completar la acción. Revisa tu conexión e intenta de nuevo.";
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
  errorText: {
    textAlign: "center",
    marginBottom: 4,
  },
});
