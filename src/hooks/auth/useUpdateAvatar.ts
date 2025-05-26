import { useState } from "react";
import { pb } from "@/lib/pocketbase";
import * as ImagePicker from "expo-image-picker";
import { useAuthCtx } from "@/context/Auth";

export default function useUpdateAvatar() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthCtx();

  const updateAvatar = async () => {
    try {
      setLoading(true);
      setError(null);

      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        setError("Se necesita permiso para acceder a la galería");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled) {
        return;
      }

      const imageUri = result.assets[0].uri;
      const filename = imageUri.split("/").pop() || "avatar.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";

      const formData = new FormData();
      formData.append("avatar", {
        uri: imageUri,
        name: filename,
        type,
      } as any);

      await pb.collection("users").update(user.id, formData);
      await pb.collection("users").authRefresh();

    } catch (err) {
      console.error("Error updating avatar:", err);
      setError("No se pudo actualizar la foto de perfil");
    } finally {
      setLoading(false);
    }
  };

  return { updateAvatar, loading, error };
} 