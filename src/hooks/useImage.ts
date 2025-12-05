import * as ImagePicker from "expo-image-picker";
import { useState } from "react";

export default function useImage() {
  const [loading, setLoading] = useState(false);
  const pickImage = async (
    from: "camera" | "library",
    opt: ImagePicker.ImagePickerOptions
  ) => {
    setLoading(true);
    if (from === "library") {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) throw new Error("Permiso denegado");
      const result = await ImagePicker.launchImageLibraryAsync(opt);
      setLoading(false);
      return result;
    } else if (from === "camera") {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) throw new Error("Permiso de cámara denegado");
      const result = await ImagePicker.launchCameraAsync(opt);
      setLoading(false);
      return result;
    } else {
      setLoading(false);
      throw new Error("Opción no válida");
    }
  };
  return { pickImage, loading };
}
