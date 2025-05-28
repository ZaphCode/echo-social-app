import React, { useState, useCallback } from "react";
import { View, StyleSheet, ScrollView, Pressable, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useForm } from "react-hook-form";

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
  
  const { control, handleSubmit, reset } = useForm<FormData>({
    defaultValues: {
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
    },
  });

  const handleSave = handleSubmit(async (data) => {
    setSaving(true);
    try {
      await pb.collection('profiles').update(profile.id, data);
      onUpdate();
      onClose();
    } catch (error) {
      Alert.alert("Error", "No se pudo actualizar el perfil");
    } finally {
      setSaving(false);
    }
  });

  return (
    <SlideModal visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text color="white" fontFamily="bold" size={theme.fontSizes.xl}>
            {mode === "personal" ? "Información Personal" : "Información Profesional"}
          </Text>
          <Pressable onPress={onClose}>
            <Feather name="x" size={24} color={theme.colors.lightGray} />
          </Pressable>
        </View>

        <ScrollView style={styles.content}>
          <ProfileFormSection
            mode={mode}
            control={control}
            form={{} as FormData}
            onFormChange={() => {}}
          />
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title="Guardar"
            onPress={handleSave}
            loading={saving}
            disabled={saving}
          />
        </View>
      </View>
    </SlideModal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.darkGray,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  footer: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.darkGray,
  },
}); 