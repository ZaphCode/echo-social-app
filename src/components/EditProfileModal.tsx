import React, { useState, useEffect } from "react";
import {
  View,
  Modal,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useForm, Controller } from "react-hook-form";
import { theme } from "@/theme/theme";
import Text from "@/components/ui/Text";
import Field from "@/components/ui/Field";
import Button from "@/components/ui/Button";
import useUpdateProfile from "@/hooks/auth/useUpdateProfile";
import { ClientProfile } from "@/models/ClientProfile";
import { ProviderProfile } from "@/models/ProviderProfile";
import { useAuthCtx } from "@/context/Auth";

type ProfileRecord = ClientProfile | ProviderProfile;

type Props = {
  visible: boolean;
  onClose: () => void;
  profile: ProfileRecord;
  onUpdate?: () => void;
  mode: "personal" | "professional";
};

type FormData = {
  phone: string;
  state: string;
  city: string;
  address: string;
  zip: string;
  description?: string;
  experience_years?: string;
};

export default function EditProfileModal({ visible, onClose, profile, onUpdate, mode }: Props) {
  const { updateProfile, loading, error } = useUpdateProfile();
  const [isClosing, setIsClosing] = useState(false);
  const { user } = useAuthCtx();

  const showAlert = (message: string, shouldClose: boolean = false) => {
    if (isClosing) return;
    
    Alert.alert(
      "",
      message,
      [{ 
        text: "OK",
        onPress: () => {
          if (shouldClose) {
            setIsClosing(true);
            onUpdate?.();
            onClose();
            reset();
          }
        }
      }],
      { 
        cancelable: true,
        onDismiss: () => {
          if (shouldClose) {
            setIsClosing(true);
            onUpdate?.();
            onClose();
            reset();
          }
        }
      }
    );
  };

  const { control, handleSubmit, reset, watch } = useForm<FormData>({
    defaultValues: {
      phone: profile.phone || "",
      state: profile.state || "",
      city: profile.city || "",
      address: profile.address || "",
      zip: profile.zip || "",
      description: (profile as ProviderProfile).description || "",
      experience_years: (profile as ProviderProfile).experience_years?.toString() || "",
    },
  });

  // Watch all form values
  const formValues = watch();

  const hasChanges = () => {
    const currentValues = {
      phone: profile.phone || "",
      state: profile.state || "",
      city: profile.city || "",
      address: profile.address || "",
      zip: profile.zip || "",
      description: (profile as ProviderProfile).description || "",
      experience_years: (profile as ProviderProfile).experience_years?.toString() || "",
    };

    return Object.keys(formValues).some(key => {
      const formValue = formValues[key as keyof FormData];
      const currentValue = currentValues[key as keyof FormData];
      return formValue !== currentValue;
    });
  };

  const onSubmit = async (data: FormData) => {
    if (!hasChanges()) {
      showAlert("No hay cambios para guardar");
      return;
    }

    const updateData = {
      ...data,
      experience_years: data.experience_years ? parseInt(data.experience_years) : undefined,
    };

    const success = await updateProfile(updateData);
    if (success) {
      showAlert("Perfil actualizado exitosamente", true);
    }
  };

  // Reset isClosing when modal becomes visible
  useEffect(() => {
    if (visible) {
      setIsClosing(false);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text fontFamily="bold" color="white" size={theme.fontSizes.lg}>
              {mode === "personal" ? "Editar Información Personal" : "Editar Información Profesional"}
            </Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={24} color={theme.colors.lightGray} />
            </Pressable>
          </View>

          <ScrollView style={styles.form}>
            {mode === "personal" ? (
              <View style={styles.section}>
                <Field
                  name="phone"
                  label="Teléfono"
                  control={control}
                  placeholder="Ingresa tu número de teléfono"
                  icon="phone"
                  keyboardType="numeric"
                />

                <Field
                  name="address"
                  label="Dirección"
                  control={control}
                  placeholder="Ingresa tu dirección"
                  icon="map-pin"
                />

                <Field
                  name="city"
                  label="Ciudad"
                  control={control}
                  placeholder="Ingresa tu ciudad"
                  icon="map-pin"
                />

                <Field
                  name="state"
                  label="Estado"
                  control={control}
                  placeholder="Ingresa tu estado"
                  icon="map-pin"
                />

                <Field
                  name="zip"
                  label="Código Postal"
                  control={control}
                  placeholder="Ingresa tu código postal"
                  icon="map-pin"
                  keyboardType="numeric"
                />
              </View>
            ) : (
              <View style={styles.section}>
                <Field
                  name="description"
                  label="Descripción"
                  control={control}
                  placeholder="Cuéntanos sobre ti y tus servicios"
                  icon="info"
                  multiline
                  numberOfLines={4}
                />

                <Field
                  name="experience_years"
                  label="Años de Experiencia"
                  control={control}
                  placeholder="Ingresa tus años de experiencia"
                  icon="award"
                  keyboardType="numeric"
                />
              </View>
            )}

            {error && (
              <Text color="error" style={styles.errorText}>
                {error}
              </Text>
            )}

            <Button
              title={loading ? "Actualizando..." : "Guardar Cambios"}
              onPress={handleSubmit(onSubmit)}
              disabled={loading}
              style={styles.submitButton}
            />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: theme.colors.darkGray,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  closeButton: {
    padding: 5,
  },
  form: {
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  submitButton: {
    marginTop: 20,
  },
  errorText: {
    marginTop: 10,
    textAlign: "center",
  },
}); 