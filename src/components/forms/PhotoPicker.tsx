import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Control, Controller, RegisterOptions } from "react-hook-form";
import { Feather } from "@expo/vector-icons";

import useImage from "@/hooks/useImage";
import useModal from "@/hooks/useModal";
import useTheme from "@/hooks/useTheme";
import { radius } from "@/theme/theme";
import { SlideModal } from "../ui/SlideModal";
import StorageImage from "../ui/StorageImage";
import Text from "../ui/Text";
import { FieldShell } from "./Field";
import ImageOpts from "./ImageOpts";

const MAX_IMAGES = 5;

type Props = {
  control: Control<any>;
  name: string;
  rules?: RegisterOptions;
  label?: string;
};

export default function PhotoPicker({ control, name, rules, label = "Fotos" }: Props) {
  const { colors } = useTheme();
  const [visible, open, close] = useModal();
  const { pickImage } = useImage();

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { value, onChange }, fieldState: { error } }) => {
        const images: string[] = value || [];

        const handlePick = async (option: "camera" | "library") => {
          try {
            const result = await pickImage(option, {
              mediaTypes: "images",
              allowsEditing: true,
              quality: 0.7,
            });
            if (!result.canceled && result.assets?.length) {
              onChange([...images, result.assets[0].uri]);
            }
          } catch {
            Alert.alert(
              "No se pudo agregar la foto",
              "Revisa los permisos de cámara y fotos e intenta de nuevo.",
            );
          } finally {
            close();
          }
        };

        return (
          <FieldShell
            label={`${label} · ${images.length}/${MAX_IMAGES}`}
            error={error?.message}
            hint="La primera foto será la portada."
          >
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
              {images.length < MAX_IMAGES && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Agregar foto"
                  onPress={open}
                  style={[styles.tile, styles.add, { borderColor: colors.lineStrong, backgroundColor: colors.surface }]}
                >
                  <Feather name="plus" size={24} color={colors.accentText} />
                  <Text variant="caption" bold tone="accent">
                    Agregar
                  </Text>
                </Pressable>
              )}
              {images.map((uri, index) => (
                <View key={uri} style={styles.tile}>
                  <StorageImage bucket="service-photos" path={uri} style={styles.image} />
                  {index === 0 && (
                    <View style={styles.cover}>
                      <Text variant="micro" bold color="#FFFFFF">
                        Portada
                      </Text>
                    </View>
                  )}
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Quitar foto"
                    hitSlop={8}
                    style={styles.remove}
                    onPress={() => onChange(images.filter((img) => img !== uri))}
                  >
                    <Feather name="x" size={14} color="#FFFFFF" />
                  </Pressable>
                </View>
              ))}
            </ScrollView>
            <SlideModal visible={visible} onClose={close}>
              <ImageOpts
                onPressCamera={() => handlePick("camera")}
                onPressLibrary={() => handlePick("library")}
              />
            </SlideModal>
          </FieldShell>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 10,
  },
  tile: {
    width: 96,
    height: 96,
    borderRadius: 18,
    overflow: "hidden",
  },
  add: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  cover: {
    position: "absolute",
    left: 6,
    bottom: 6,
    paddingHorizontal: 7,
    height: 20,
    borderRadius: radius.pill,
    justifyContent: "center",
    backgroundColor: "rgba(14,15,17,0.65)",
  },
  remove: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(14,15,17,0.65)",
  },
});
