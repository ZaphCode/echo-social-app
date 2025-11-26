import React, { useState } from "react";
import { View, Image, Pressable, StyleSheet, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Feather } from "@expo/vector-icons";
import { theme } from "@/theme/theme";
import useColorScheme from "@/hooks/useColorScheme";

interface Props {
  onChange: (uri: string) => void;
  image?: string;
  viewOnly?: boolean;
}

export default function AvatarPicker({ image, viewOnly, onChange }: Props) {
  const [img, setImg] = useState(image);
  const { colors } = useColorScheme();

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permiso denegado", "Se necesita acceso a tu galería.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
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
  };

  return (
    <View style={styles.center}>
      <Pressable onPress={pickImage} disabled={viewOnly}>
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
