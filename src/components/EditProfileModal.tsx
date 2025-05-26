import React, { useState, useCallback } from "react";
import { View, StyleSheet, ScrollView, Pressable, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";

import { theme } from "@/theme/theme";
import Text from "./ui/Text";
import Button from "./ui/Button";
import { SlideModal } from "./ui/SlideModal";
import ProfileFormSection from "./profile/ProfileFormSection";
import { ProfileWithUser } from "@/hooks/profile/useClientProfile";
import { pb } from "@/lib/pocketbase";
import { ProviderProfile } from "@/models/ProviderProfile";
import { FormData } from "./profile/types";

type Props = {
  visible: boolean;
  onClose: () => void;
  profile: ProfileWithUser;
  onUpdate: () => void;
  mode: "personal" | "professional";
};

export default function EditProfileModal({ visible, onClose, profile, onUpdate, mode }: Props) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormData>({
    phone: profile.phone || "",
    state: profile.state || "",
    city: profile.city || "",
    address: profile.address || "",
    zip: profile.zip || "",
    ...(mode === "professional" && {
      description: (profile as ProviderProfile).description || "",
      experience_years: ((profile as ProviderProfile).experience_years || 0).toString(),
      available_days: (profile as ProviderProfile).available_days || [],
    }),
  });

  const handleFormChange = useCallback((field: keyof FormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSave = async () => {
    if (!profile) {
      console.error("No profile found");
      return;
    }

    setSaving(true);
    try {
      const isProviderProfile = 'description' in profile || 'experience_years' in profile;
      const collection = isProviderProfile ? "provider_profile" : "client_profile";
      
      const updateData = mode === "professional" 
        ? {
            phone: form.phone,
            state: form.state,
            city: form.city,
            address: form.address,
            zip: form.zip,
            description: form.description || "",
            experience_years: parseInt(form.experience_years || "0"),
            available_days: form.available_days || [],
          }
        : {
            phone: form.phone,
            state: form.state,
            city: form.city,
            address: form.address,
            zip: form.zip,
          };

      // Verify profile exists
      await pb.collection(collection).getOne(profile.id);
      
      // Update profile
      await pb.collection(collection).update(profile.id, updateData);
      
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert(
        "Error",
        "No se pudo actualizar el perfil. Por favor, intente nuevamente."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <SlideModal visible={visible} onClose={onClose}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text fontFamily="bold" color="white" size={theme.fontSizes.lg}>
            {mode === "personal" ? "Editar Información Personal" : "Editar Información Profesional"}
          </Text>
          <Pressable onPress={onClose}>
            <Feather name="x" size={24} color={theme.colors.lightGray} />
          </Pressable>
        </View>

        <ScrollView style={styles.formContainer} contentContainerStyle={styles.formContent}>
          <ProfileFormSection
            mode={mode}
            form={form}
            onFormChange={handleFormChange}
          />

          <View style={styles.buttonContainer}>
            <Button
              title={saving ? "Guardando..." : "Guardar Cambios"}
              style={{ backgroundColor: theme.colors.primaryBlue, width: '100%' }}
              textColor="white"
              onPress={handleSave}
              disabled={saving}
            />
          </View>
        </ScrollView>
      </View>
    </SlideModal>
  );
}

const styles = StyleSheet.create({
  modalContent: {
    padding: 24,
    width: '100%',
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  formContainer: {
    flex: 1,
  },
  formContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
}); 