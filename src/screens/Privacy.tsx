import { useState } from "react";
import { View, StyleSheet, Alert, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as MediaLibrary from "expo-media-library";
import Text from "@/components/ui/Text";
import Button from "@/components/ui/Button";
import { radius, space } from "@/theme/theme";
import { useAlertCtx } from "@/context/Alert";
import useTheme from "@/hooks/useTheme";

export default function Privacy() {
  const { show } = useAlertCtx();
  const [loading, setLoading] = useState(false);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const downloadPrivacyPDF = async () => {
    setLoading(true);
    try {
      const PDF_URL =
        "https://raw.githubusercontent.com/ZaphCode/echo-files/main/privacy-advice.pdf";
      const fileName = "Politica_de_Privacidad_Echo.pdf";
      const tempUri = FileSystem.cacheDirectory + fileName;

      await FileSystem.downloadAsync(PDF_URL, tempUri);

      if (Platform.OS === "android") {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permiso requerido",
            "Necesitas dar permiso para guardar archivos."
          );
          return;
        }
        const asset = await MediaLibrary.createAssetAsync(tempUri);
        await MediaLibrary.createAlbumAsync("Download", asset, false);
        Alert.alert(
          "¡Descarga exitosa!",
          "El PDF se guardó en la carpeta Descargas de tu dispositivo."
        );
      } else {
        // iOS: Sharing como antes
        if (!(await Sharing.isAvailableAsync())) {
          Alert.alert(
            "No se puede compartir",
            "Esta función no está disponible en tu dispositivo."
          );
          return;
        }
        await Sharing.shareAsync(tempUri, {
          mimeType: "application/pdf",
          dialogTitle: "Guardar o compartir política de privacidad",
        });
      }
    } catch (e) {
      console.log(e);
      show({
        title: "Error al descargar",
        message:
          "Hubo un problema al descargar el PDF. Asegúrate que tienes conexión o intenta más tarde.",
        icon: "alert",
        iconColor: colors.danger,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg, paddingBottom: insets.bottom + space.md }]}>
      <View style={styles.body}>
        <View style={[styles.icon, { backgroundColor: colors.accentSoft }]}>
          <Feather name="shield" size={30} color={colors.accentText} />
        </View>
        <Text variant="title">Tu privacidad</Text>
        <Text tone="muted">
          Descarga, guarda o comparte el documento completo de nuestra política de privacidad
          para revisarlo cuando lo necesites.
        </Text>
        <View style={[styles.note, { backgroundColor: colors.surface, borderColor: colors.line }]}>
          <Feather name="map-pin" size={16} color={colors.textMuted} />
          <Text variant="label" tone="muted" style={styles.flex}>
            En el mapa solo mostramos la zona aproximada (~500 m) de cada contratación, nunca la
            dirección exacta.
          </Text>
        </View>
      </View>
      <Button title="Descargar PDF" icon="download" onPress={downloadPrivacyPDF} loading={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: space.gutter,
    paddingTop: space.md,
    justifyContent: "space-between",
  },
  body: {
    gap: 12,
  },
  icon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  note: {
    flexDirection: "row",
    gap: 10,
    padding: 14,
    borderRadius: radius.card,
    borderWidth: 1,
    marginTop: 8,
  },
  flex: {
    flex: 1,
  },
});
