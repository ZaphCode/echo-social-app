import { useEffect, useState } from "react";
import { Modal, StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useAlertCtx } from "@/context/Alert";
import useTheme from "@/hooks/useTheme";
import { radius, space } from "@/theme/theme";
import Button from "./Button";
import Text from "./Text";

export function AlertModal() {
  const { hide, visible, icon, message, title, iconColor, onConfirm } =
    useAlertCtx();
  const { colors } = useTheme();
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

  const accent = iconColor || colors.accent;

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={[styles.overlay, { backgroundColor: colors.scrim }]}>
        <View style={[styles.modal, { backgroundColor: colors.surface }]}>
          <View style={[styles.iconWrap, { backgroundColor: `${accent}22` }]}>
            <MaterialCommunityIcons name={icon} size={30} color={accent} />
          </View>
          <Text variant="heading" align="center">
            {title}
          </Text>
          <Text tone="muted" align="center">
            {message}
          </Text>
          {errorMessage ? (
            <Text variant="label" tone="danger" align="center">
              {errorMessage}
            </Text>
          ) : null}
          {onConfirm ? (
            <View style={styles.buttonRow}>
              <Button
                style={styles.flex}
                variant="secondary"
                size="md"
                title="Cancelar"
                disabled={confirming}
                onPress={hide}
              />
              <Button
                style={styles.flex}
                size="md"
                title="Confirmar"
                loading={confirming}
                onPress={handleConfirm}
              />
            </View>
          ) : (
            <Button
              style={styles.single}
              size="md"
              title="Entendido"
              onPress={hide}
            />
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
    padding: space.gutter,
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    width: "100%",
    maxWidth: 380,
    padding: space.lg,
    gap: space.xs,
    borderRadius: radius.card + 6,
    alignItems: "center",
  },
  iconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: space.xs,
  },
  buttonRow: {
    flexDirection: "row",
    width: "100%",
    gap: space.xs,
    marginTop: space.sm,
  },
  flex: {
    flex: 1,
  },
  single: {
    alignSelf: "stretch",
    marginTop: space.sm,
  },
});
