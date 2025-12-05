import React, { useState } from "react";
import { View, Image, Pressable, StyleSheet, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import { theme } from "@/theme/theme";
import useColorScheme from "@/hooks/useColorScheme";
import useImage from "@/hooks/useImage";
import useModal from "@/hooks/useModal";
import { SlideModal } from "../ui/SlideModal";
import ImageOpts from "./ImageOpts";

interface Props {
  onChange: (uri: string) => void;
  image?: string;
  viewOnly?: boolean;
}

export default function AvatarPicker({ image, viewOnly, onChange }: Props) {
  const [img, setImg] = useState(image);
  const { colors } = useColorScheme();
  const { pickImage } = useImage();
  const [visible, open, close] = useModal();

  const onPress = async (option: "camera" | "library") => {
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
    } catch (error) {
      Alert.alert("Error", "No se pudo seleccionar la imagen.");
    } finally {
      close();
    }
  };

  return (
    <View style={styles.center}>
      <Pressable onPress={open} disabled={viewOnly}>
        {img ? (
          <Image
            source={{ uri: img }}
            style={[
              styles.image,
              {
                backgroundColor: colors.darkerGray,
                borderWidth: 2,
                borderColor: colors.lightGray,
              },
            ]}
          />
        ) : (
          <View
            style={[
              styles.image,
              styles.placeholder,
              { backgroundColor: colors.darkerGray },
            ]}
          >
            <Feather name="user" size={48} color={colors.lightGray} />
          </View>
        )}
        {!viewOnly && (
          <View style={styles.iconContainer}>
            <Feather name="camera" size={18} color={colors.primaryBlue} />
          </View>
        )}
        <SlideModal visible={visible} onClose={close}>
          <ImageOpts
            onPressCamera={() => onPress("camera")}
            onPressLibrary={() => onPress("library")}
          />
        </SlideModal>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: "center",
    marginVertical: theme.spacing.lg,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    position: "absolute",
    bottom: 6,
    right: 6,
    backgroundColor: theme.colors.secondaryBlue,
    borderRadius: 15,
    padding: 6,
  },
});
