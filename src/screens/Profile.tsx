import React, { useState, useCallback } from "react";
import { View, StyleSheet, Pressable, ScrollView, ActivityIndicator, Modal, TextInput, TouchableWithoutFeedback, Alert, Switch } from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';

import { theme } from "@/theme/theme";
import Text from "@/components/ui/Text";
import Button from "@/components/ui/Button";
import EditProfileModal from "@/components/EditProfileModal";
import PrivacyContractModal from "@/components/PrivacyContractModal";
import HelpFormModal from "@/components/HelpFormModal";
import useLogout from "@/hooks/auth/useLogout";
import useClientProfile from "@/hooks/profile/useClientProfile";
import { useAuthCtx } from "@/context/Auth";
import { getFileUrl } from "@/utils/format";
import { pb } from "@/lib/pocketbase";
import { ProviderProfile } from "@/models/ProviderProfile";

const formatAvailableDays = (days: string[]) => {
  const dayMap: { [key: string]: string } = {
    MON: "Lunes",
    TUE: "Martes",
    WED: "Miércoles",
    THU: "Jueves",
    FRI: "Viernes",
    SAT: "Sábado",
    SUN: "Domingo",
  };
  return days.map(day => dayMap[day] || day).join(", ");
};

export default function Profile() {
  const logout = useLogout();
  const { user } = useAuthCtx();
  const [refreshKey, setRefreshKey] = useState(0);
  const { profile, loading, error } = useClientProfile(refreshKey);
  const [editModal, setEditModal] = useState(false);
  const [isEditProfessionalModalVisible, setIsEditProfessionalModalVisible] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isPrivacyModalVisible, setIsPrivacyModalVisible] = useState(false);
  const [isHelpModalVisible, setIsHelpModalVisible] = useState(false);

  const handleRetry = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  const openEdit = () => {
    if (profile) {
      setEditModal(true);
    }
  };

  // Update avatar function implementation
  const updateAvatar = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Necesitamos acceso a tu galería para cambiar tu foto de perfil.');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled) {
        return;
      }

      setAvatarLoading(true);
      setAvatarError(null);

      // Get the selected image
      const imageUri = result.assets[0].uri;
      
      // Create form data for upload
      const formData = new FormData();
      formData.append('avatar', {
        uri: imageUri,
        name: 'avatar.jpg',
        type: 'image/jpeg',
      } as any);

      // Update user avatar in PocketBase
      await pb.collection('users').update(user.id, formData);

      // Refresh the profile to show the new avatar
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Error updating avatar:', error);
      setAvatarError(error instanceof Error ? error.message : "Error al actualizar la foto de perfil");
    } finally {
      setAvatarLoading(false);
    }
  };

  const toggleNotifications = useCallback((value: boolean) => {
    setNotificationsEnabled(value);
    // TODO: Implement actual notifications toggle logic
    console.log('Notifications toggled:', value);
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.colors.primaryBlue} />
      </SafeAreaView>
    );
  }

  if (error || !profile) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <Text color="white" size={theme.fontSizes.lg}>
          {error?.message || "No se pudo cargar el perfil"}
        </Text>
        <Button
          title="Reintentar"
          style={[styles.retryButton, { backgroundColor: theme.colors.primaryBlue }]}
          onPress={handleRetry}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={{ width: "100%" }}
        contentContainerStyle={{ alignItems: "center", paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.imageContainer}>
            {user.avatar ? (
              <Image
                source={{ uri: getFileUrl("users", user.id, user.avatar) }}
                contentFit="fill"
                style={styles.profileImage}
              />
            ) : (
              <View style={[styles.profileImage, styles.placeholderImage]}>
                <Feather name="user" size={40} color={theme.colors.lightGray} />
              </View>
            )}
            <Pressable
              style={[styles.editImageButton, avatarLoading && styles.disabledButton]}
              onPress={updateAvatar}
              disabled={avatarLoading}
            >
              {avatarLoading ? (
                <ActivityIndicator size="small" color={theme.colors.lightGray} />
              ) : (
                <Feather name="camera" size={16} color={theme.colors.lightGray} />
              )}
            </Pressable>
            {avatarError && (
              <Text color="error" style={styles.errorText}>
                {avatarError}
              </Text>
            )}
          </View>

          <Text fontFamily="bold" color="white" size={theme.fontSizes.xl}>
            {user.name}
          </Text>
          <View style={styles.roleContainer}>
            <Feather name="award" size={16} color="white" style={{ marginRight: 5 }} />
            <Text style={styles.roleText}>
              {user.role === "client" ? "Cliente" : "Prestador de Servicio"}
            </Text>
          </View>
        </View>

        {user.role === "provider" && profile && (
          <>
            <View style={styles.statsContainer}>
              <StatBox
                value={(profile as ProviderProfile).jobs_done || 0}
                label="Servicios Completados"
              />
              <View style={styles.statsDivider} />
              <StatBox
                value={(profile as ProviderProfile).experience_years || 0}
                label="Años de Experiencia"
              />
            </View>

            <View style={styles.infoContainer}>
              <View style={styles.sectionHeader}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Feather name="briefcase" size={20} color={theme.colors.primaryBlue} />
                  <Text style={{ color: "#FFFFFF", fontSize: theme.fontSizes.lg, fontFamily: theme.fontFamily.bold }}>
                    Información Profesional
                  </Text>
                </View>
                <Pressable
                  style={styles.editButton}
                  onPress={() => setIsEditProfessionalModalVisible(true)}
                >
                  <Feather name="edit-2" size={18} color={theme.colors.primaryBlue} />
                  <Text style={{ color: theme.colors.primaryBlue, fontSize: theme.fontSizes.sm, fontFamily: theme.fontFamily.bold }}>
                    Editar
                  </Text>
                </Pressable>
              </View>

              {(profile as ProviderProfile).description && (
                <InfoRow
                  icon="info"
                  label="Descripción"
                  value={(profile as ProviderProfile).description}
                />
              )}

              {(profile as ProviderProfile).available_days?.length > 0 && (
                <InfoRow
                  icon="calendar"
                  label="Días Disponibles"
                  value={formatAvailableDays((profile as ProviderProfile).available_days)}
                />
              )}
            </View>
          </>
        )}

        <View style={styles.infoContainer}>
          <View style={styles.sectionHeader}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Feather name="user" size={20} color={theme.colors.primaryBlue} />
              <Text style={{ color: "#FFFFFF", fontSize: theme.fontSizes.lg, fontFamily: theme.fontFamily.bold }}>
                Información Personal
              </Text>
            </View>
            <Pressable style={styles.editButton} onPress={openEdit}>
              <Feather name="edit-2" size={18} color={theme.colors.primaryBlue} />
              <Text style={{ color: theme.colors.primaryBlue, fontSize: theme.fontSizes.sm, fontFamily: theme.fontFamily.bold }}>
                Editar
              </Text>
            </Pressable>
          </View>

          <InfoRow icon="mail" label="Email" value={user.email || ""} />
          {profile?.phone && (
            <InfoRow icon="phone" label="Teléfono" value={profile.phone} />
          )}
          {profile?.address && (
            <InfoRow
              icon="map-pin"
              label="Dirección"
              value={`${profile.address}${profile.city ? `, ${profile.city}` : ""}${
                profile.state ? `, ${profile.state}` : ""
              }`}
            />
          )}
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.sectionHeader}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Feather name="settings" size={20} color={theme.colors.primaryBlue} />
              <Text style={{ color: "#FFFFFF", fontSize: theme.fontSizes.lg, fontFamily: theme.fontFamily.bold }}>
                Configuración
              </Text>
            </View>
          </View>

          <View style={styles.settingRow}>
            <View style={styles.labelContainer}>
              <Feather name="bell" size={20} color={theme.colors.lightGray} />
              <Text style={[styles.settingLabel, { color: "#FFFFFF" }]}>
                Notificaciones
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={toggleNotifications}
              trackColor={{ false: theme.colors.darkerGray, true: theme.colors.primaryBlue }}
              thumbColor={notificationsEnabled ? "#FFFFFF" : theme.colors.lightGray}
              ios_backgroundColor={theme.colors.darkerGray}
            />
          </View>

          <Pressable style={styles.settingRow} onPress={() => setIsPrivacyModalVisible(true)}>
            <View style={styles.labelContainer}>
              <Feather name="lock" size={20} color={theme.colors.lightGray} />
              <Text style={[styles.settingLabel, { color: "#FFFFFF" }]}>
                Privacidad
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color={theme.colors.lightGray} />
          </Pressable>

          <Pressable style={styles.settingRow} onPress={() => setIsHelpModalVisible(true)}>
            <View style={styles.labelContainer}>
              <Feather name="help-circle" size={20} color={theme.colors.lightGray} />
              <Text style={[styles.settingLabel, { color: "#FFFFFF" }]}>
                Ayuda
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color={theme.colors.lightGray} />
          </Pressable>
        </View>

        <Button
          title="Cerrar Sesión"
          style={[styles.logoutButton, { backgroundColor: theme.colors.darkGray }]}
          onPress={logout}
        />
      </ScrollView>

      <EditProfileModal
        visible={editModal}
        onClose={() => setEditModal(false)}
        profile={profile!}
        onUpdate={() => {
          setEditModal(false);
          setRefreshKey(prev => prev + 1);
        }}
        mode="personal"
      />

      <EditProfileModal
        visible={isEditProfessionalModalVisible}
        onClose={() => setIsEditProfessionalModalVisible(false)}
        profile={profile!}
        onUpdate={() => {
          setIsEditProfessionalModalVisible(false);
          setRefreshKey(prev => prev + 1);
        }}
        mode="professional"
      />

      <PrivacyContractModal
        visible={isPrivacyModalVisible}
        onClose={() => setIsPrivacyModalVisible(false)}
      />

      <HelpFormModal
        visible={isHelpModalVisible}
        onClose={() => setIsHelpModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) => (
  <View style={styles.infoRow}>
    <View style={styles.labelContainer}>
      <Feather name={icon} size={20} color={theme.colors.lightGray} />
      <Text style={[styles.label, { color: theme.colors.lightGray }]}>
        {label}
      </Text>
    </View>
    <Text style={[styles.value, { color: "#FFFFFF" }]}>
      {value}
    </Text>
  </View>
);

const StatBox = ({
  value,
  label,
}: {
  value: string | number;
  label: string;
}) => (
  <View style={[styles.statBox, { alignItems: 'center', justifyContent: 'center' }]}>
    <Text style={{ 
      color: theme.colors.primaryBlue, 
      fontFamily: theme.fontFamily.bold, 
      fontSize: theme.fontSizes.xl,
      textAlign: 'center',
      width: '100%'
    }}>
      {value.toString()}
    </Text>
    <Text
      style={{ 
        color: "#FFFFFF",
        fontSize: theme.fontSizes.sm,
        textAlign: "center",
        marginTop: 4,
        width: '100%'
      }}
    >
      {label}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    alignItems: "center",
    paddingVertical: 20,
    width: "100%",
  },
  imageContainer: {
    position: "relative",
    marginBottom: 15,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: theme.colors.primaryBlue,
  },
  editImageButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.darkGray,
    padding: 8,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: theme.colors.background,
  },
  roleContainer: {
    backgroundColor: theme.colors.primaryBlue,
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 5,
    flexDirection: "row",
    alignItems: "center",
  },
  roleText: {
    color: "white",
    fontSize: theme.fontSizes.sm,
    fontWeight: "600",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "90%",
    backgroundColor: theme.colors.darkGray,
    borderRadius: 15,
    padding: 15,
    marginTop: 10,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  statsDivider: {
    width: 1,
    height: "70%",
    backgroundColor: theme.colors.lightGray,
    opacity: 0.2,
  },
  infoContainer: {
    width: "90%",
    backgroundColor: theme.colors.darkGray,
    borderRadius: 15,
    padding: 20,
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  infoRow: {
    marginBottom: 15,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  label: {
    fontSize: theme.fontSizes.sm,
  },
  value: {
    fontSize: theme.fontSizes.md,
    marginLeft: 28,
    marginTop: 5,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  settingLabel: {
    fontSize: theme.fontSizes.md,
  },
  logoutButton: {
    width: "90%",
    marginTop: 20,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  retryButton: {
    marginTop: 20,
    width: "50%",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.darkerGray + 'b3',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: theme.colors.darkGray,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
    width: '95%',
    marginHorizontal: '2.5%',
    maxHeight: '95%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.darkerGray,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  inputIcon: {
    marginRight: 12,
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    color: "white",
    fontSize: 16,
    paddingVertical: 12,
  },
  inputLabel: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.lightGray,
    marginBottom: 4,
    marginLeft: 4,
  },
  disabledButton: {
    opacity: 0.5,
  },
  errorText: {
    position: "absolute",
    bottom: -25,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: theme.fontSizes.sm,
  },
  placeholderImage: {
    backgroundColor: theme.colors.darkGray,
    justifyContent: "center",
    alignItems: "center",
  },
});
