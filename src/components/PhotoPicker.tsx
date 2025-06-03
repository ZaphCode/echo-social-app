import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ScrollView,
  Alert,
} from "react-native";
import { Controller, Control, RegisterOptions } from "react-hook-form";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { theme } from "@/theme/theme";
import { Service } from "@/models/Service";
import { getFileUrl } from "@/utils/format";

const MAX_IMAGES = 5;

interface Props {
  control: Control<any>;
  name: string;
  rules?: RegisterOptions;
  service?: Service;
}

function PhotoPicker({ control, name, rules, service }: Props) {
  const getPreviewUrl = (img: string) => {
    if (img.startsWith("file://") || img.startsWith("http")) return img;
    if (service?.id) return getFileUrl("service", service.id, img);
    return img;
  };

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      defaultValue={service?.photos || []}
      render={({ field: { value, onChange }, fieldState: { error } }) => {
        const images = value || [];

        const pickImage = async () => {
          const permissionResult =
            await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!permissionResult.granted) {
            Alert.alert(
              "Permiso denegado",
              "Necesitamos acceso a tu galería para seleccionar fotos."
            );
            return;
          }

          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: "images",
            allowsEditing: true,
            quality: 0.7,
          });
          if (!result.canceled && result.assets?.length) {
            onChange([...images, result.assets[0].uri]);
          }
        };

        const removeImage = (uri: string) => {
          onChange(images.filter((img: string) => img !== uri));
        };

        return (
          <View style={styles.photosSection}>
            <Text style={styles.label}>Fotos del servicio</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 8, paddingTop: 10 }}
            >
              {images.map((uri: string) => (
                <View key={uri} style={styles.imageWrapper}>
                  <Image
                    source={{ uri: getPreviewUrl(uri) }}
                    style={styles.image}
                  />
                  <Pressable
                    style={styles.removeBtn}
                    onPress={() => removeImage(uri)}
                  >
                    <Feather name="x" size={16} color="#fff" />
                  </Pressable>
                </View>
              ))}
              {images.length < MAX_IMAGES && (
                <Pressable style={styles.addBtn} onPress={pickImage}>
                  <Feather
                    name="plus"
                    size={28}
                    color={theme.colors.lightGray}
                  />
                </Pressable>
              )}
            </ScrollView>

            {error ? (
              <Text
                style={{
                  color: theme.colors.redError,
                  marginLeft: theme.spacing.sm,
                  marginTop: 2,
                }}
              >
                {error.message}
              </Text>
            ) : (
              <Text style={styles.photoHint}>
                Puedes subir hasta {MAX_IMAGES} fotos. La primera será la
                portada.
              </Text>
            )}
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  photosSection: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    color: theme.colors.lightGray,
    fontSize: theme.fontSizes.md,
    marginBottom: theme.spacing.sm,
    marginLeft: theme.spacing.sm,
  },
  imageWrapper: {
    position: "relative",
    marginRight: 14,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 10,
    borderColor: theme.colors.lightGray,
    borderWidth: 1,
  },
  removeBtn: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#FF6959",
    borderRadius: 10,
    padding: 2,
    zIndex: 1,
  },
  addBtn: {
    width: 70,
    height: 70,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.lightGray,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
    backgroundColor: "transparent",
  },
  photoHint: {
    color: theme.colors.lightGray,
    fontSize: theme.fontSizes.sm,
    marginTop: 4,
    marginLeft: theme.spacing.sm,
  },
});

export default PhotoPicker;
