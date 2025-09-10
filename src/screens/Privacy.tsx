import { useState } from "react";
import { View, StyleSheet, Alert, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as MediaLibrary from "expo-media-library";
import Text from "@/components/ui/Text";
import Button from "@/components/ui/Button";
import { theme } from "@/theme/theme";
import { useAlertCtx } from "@/context/Alert";

export default function Privacy() {
  const { show } = useAlertCtx();
  const [loading, setLoading] = useState(false);

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
        iconColor: theme.colors.redError,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Feather
        name="shield"
        size={54}
        color={theme.colors.primaryBlue}
        style={{ alignSelf: "center", marginBottom: 10 }}
      />
      <Text style={styles.title}>Privacidad</Text>
      <Text>
        Puedes descargar, guardar o compartir el documento completo de nuestra
        política de privacidad en tu dispositivo para revisarlo cuando lo
        necesites.
      </Text>
      <View style={{ marginTop: 20 }}>
        <Button
          style={styles.button}
          title={"Descargar PDF"}
          onPress={downloadPrivacyPDF}
          loading={loading}
          disabled={loading}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    gap: 10,
  },
  title: {
    textAlign: "center",
    fontSize: theme.fontSizes.xxl,
    fontFamily: theme.fontFamily.bold,
    color: "white",
  },
  button: {
    marginTop: 10,
  },
});
