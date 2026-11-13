import { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import useImage from "@/hooks/useImage";
import useModal from "@/hooks/useModal";
import useTheme from "@/hooks/useTheme";
import { SlideModal } from "../ui/SlideModal";
import StorageImage from "../ui/StorageImage";
import ImageOpts from "./ImageOpts";

type Props = {
  onChange: (uri: string) => void;
  image?: string;
  bucket?: string;
  viewOnly?: boolean;
  size?: number;
};

export default function AvatarPicker({ image, bucket, viewOnly, onChange, size = 112 }: Props) {
  const [img, setImg] = useState(image);
  const { colors } = useTheme();
  const { pickImage } = useImage();
  const [visible, open, close] = useModal();

  useEffect(() => {
    setImg(image);
  }, [image]);

  const onPick = async (option: "camera" | "library") => {
    try {
      const result = await pickImage(option, {
        mediaTypes: "images",
        allowsMultipleSelection: false,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.length) {
        setImg(result.assets[0].uri);
        onChange(result.assets[0].uri);
      }
    } catch {
      Alert.alert("No se pudo elegir la imagen", "Revisa los permisos e intenta de nuevo.");
    } finally {
      close();
    }
  };

  const circle = { width: size, height: size, borderRadius: size / 2 };

  return (
    <>
      <Pressable
        accessibilityRole={viewOnly ? "image" : "button"}
        accessibilityLabel={viewOnly ? "Foto de perfil" : "Cambiar foto de perfil"}
        onPress={open}
        disabled={viewOnly}
        style={[styles.ring, { borderColor: colors.accent, borderRadius: size / 2 + 5 }]}
      >
        {img ? (
          <StorageImage bucket={bucket} path={img} style={circle} />
        ) : (
          <View style={[circle, styles.placeholder, { backgroundColor: colors.surface2 }]}>
            <Feather name="user" size={size * 0.4} color={colors.textSubtle} />
          </View>
        )}
        {!viewOnly && (
          <View style={[styles.badge, { backgroundColor: colors.accent, borderColor: colors.bg }]}>
            <Feather name="camera" size={15} color={colors.onAccent} />
          </View>
        )}
      </Pressable>
      <SlideModal visible={visible} onClose={close}>
        <ImageOpts onPressCamera={() => onPick("camera")} onPressLibrary={() => onPick("library")} />
      </SlideModal>
    </>
  );
}

const styles = StyleSheet.create({
  ring: {
    padding: 3,
    borderWidth: 2,
    alignSelf: "center",
  },
  placeholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    right: 0,
    bottom: 2,
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
  },
});
