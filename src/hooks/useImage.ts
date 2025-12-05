import * as ImagePicker from "expo-image-picker";

export default function useImage() {
  const pickImage = async (
    from: "camera" | "library",
    opt: ImagePicker.ImagePickerOptions
  ) => {
    if (from === "library") {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) throw new Error("Permiso denegado");
      return await ImagePicker.launchImageLibraryAsync(opt);
    } else {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) throw new Error("Permiso de cámara denegado");
      return await ImagePicker.launchCameraAsync(opt);
    }
  };
  return { pickImage };
}
