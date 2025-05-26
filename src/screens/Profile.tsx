import React, { useState } from "react";
import { View, StyleSheet, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { theme } from "@/theme/theme";
import Text from "@/components/ui/Text";
import Button from "@/components/ui/Button";
<<<<<<< Updated upstream

const userData = {
  nombre: "Omar Urquidez",
  email: "zaph@gmail.com",
  telefono: "+1234567890",
  direccion: "Calle Principal 123",
  role: "Cliente",
  stats: {
    serviciosCompletados: 24,
    calificacion: 4.8,
    miembroDesde: "Enero 2024"
  }
};

export default function Profile() {
  const InfoRow = ({ icon, label, value }: { icon: any; label: string; value: string }) => (
    <View style={styles.infoRow}>
      <View style={styles.labelContainer}>
        <Feather name={icon} size={20} color={theme.colors.lightGray} />
        <Text color="lightGray" style={styles.label}>{label}</Text>
      </View>
      <Text color="white" style={styles.value}>{value}</Text>
    </View>
  );

  const StatBox = ({ value, label }: { value: string | number, label: string }) => (
    <View style={styles.statBox}>
      <Text color="white" fontFamily="bold" size={theme.fontSizes.xl}>
        {value.toString()}
      </Text>
      <Text color="lightGray" size={theme.fontSizes.sm} style={{ textAlign: 'center' }}>
        {label}
      </Text>
    </View>
  );
=======
import useLogout from "@/hooks/auth/useLogout";
import useProfile from "@/hooks/auth/useProfile";
import useUpdateAvatar from "@/hooks/auth/useUpdateAvatar";
import { useAuthCtx } from "@/context/Auth";
import { getFileUrl } from "@/utils/format";
import EditProfileModal from "@/components/EditProfileModal";
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
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isEditProfessionalModalVisible, setIsEditProfessionalModalVisible] = useState(false);
  const logout = useLogout();
  const { user } = useAuthCtx();
  const { profile, loading: profileLoading, error: profileError, refetch: refetchProfile } = useProfile();
  const { updateAvatar, loading: avatarLoading, error: avatarError } = useUpdateAvatar();

  if (profileLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={theme.colors.primaryBlue} />
      </SafeAreaView>
    );
  }

  if (profileError) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <Text color="white" size={theme.fontSizes.lg}>
          {profileError}
        </Text>
      </SafeAreaView>
    );
  }
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream
            <Feather name="award" size={16} color="white" style={{ marginRight: 5 }} />
            <Text style={styles.roleText}>{userData.role}</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <StatBox 
            value={userData.stats.serviciosCompletados} 
            label="Servicios Completados" 
          />
          <View style={styles.statsDivider} />
          <StatBox 
            value={userData.stats.calificacion} 
            label="Calificación" 
          />
          <View style={styles.statsDivider} />
          <StatBox 
            value={userData.stats.miembroDesde} 
            label="Miembro Desde" 
          />
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.sectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
=======
            <Feather
              name="award"
              size={16}
              color="white"
              style={{ marginRight: 5 }}
            />
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
              <View style={styles.statsDivider} />
              <StatBox
                value={new Date(user.created).toLocaleDateString("es-ES", {
                  month: "long",
                  year: "numeric",
                })}
                label="Miembro Desde"
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
>>>>>>> Stashed changes
              <Feather name="user" size={20} color={theme.colors.primaryBlue} />
              <Text style={{ color: "#FFFFFF", fontSize: theme.fontSizes.lg, fontFamily: theme.fontFamily.bold }}>
                Información Personal
              </Text>
            </View>
            <Pressable
              style={styles.editButton}
              onPress={() => setIsEditModalVisible(true)}
            >
              <Feather name="edit-2" size={18} color={theme.colors.primaryBlue} />
<<<<<<< Updated upstream
              <Text color="primaryBlue" style={styles.editButtonText}>
=======
              <Text style={{ color: theme.colors.primaryBlue, fontSize: theme.fontSizes.sm, fontFamily: theme.fontFamily.bold }}>
>>>>>>> Stashed changes
                Editar
              </Text>
            </Pressable>
          </View>

<<<<<<< Updated upstream
          <InfoRow icon="mail" label="Email" value={userData.email} />
          <InfoRow icon="phone" label="Teléfono" value={userData.telefono} />
          <InfoRow icon="map-pin" label="Dirección" value={userData.direccion} />
=======
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
>>>>>>> Stashed changes
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.sectionHeader}>
<<<<<<< Updated upstream
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
=======
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
>>>>>>> Stashed changes
              <Feather name="settings" size={20} color={theme.colors.primaryBlue} />
              <Text fontFamily="bold" color="white" size={theme.fontSizes.lg}>
                Configuración
              </Text>
            </View>
          </View>

          <Pressable style={styles.settingRow} onPress={() => console.log("Notifications")}>
            <View style={styles.labelContainer}>
              <Feather name="bell" size={20} color={theme.colors.lightGray} />
              <Text color="white" style={styles.settingLabel}>Notificaciones</Text>
            </View>
            <Feather name="chevron-right" size={20} color={theme.colors.lightGray} />
          </Pressable>

          <Pressable style={styles.settingRow} onPress={() => console.log("Privacy")}>
            <View style={styles.labelContainer}>
              <Feather name="lock" size={20} color={theme.colors.lightGray} />
              <Text color="white" style={styles.settingLabel}>Privacidad</Text>
            </View>
            <Feather name="chevron-right" size={20} color={theme.colors.lightGray} />
          </Pressable>

          <Pressable style={styles.settingRow} onPress={() => console.log("Help")}>
            <View style={styles.labelContainer}>
              <Feather name="help-circle" size={20} color={theme.colors.lightGray} />
<<<<<<< Updated upstream
              <Text color="white" style={styles.settingLabel}>Ayuda</Text>
=======
              <Text color="white" style={styles.settingLabel}>
                Ayuda
              </Text>
>>>>>>> Stashed changes
            </View>
            <Feather name="chevron-right" size={20} color={theme.colors.lightGray} />
          </Pressable>
        </View>

        <Button
          title="Cerrar Sesión"
          style={[styles.logoutButton, { backgroundColor: theme.colors.darkGray }]}
<<<<<<< Updated upstream
          onPress={() => console.log("pa fuera mi loco")}
=======
          onPress={logout}
>>>>>>> Stashed changes
        />
      </ScrollView>

      {profile && (
        <>
          <EditProfileModal
            visible={isEditModalVisible}
            onClose={() => setIsEditModalVisible(false)}
            profile={profile}
            onUpdate={refetchProfile}
            mode="personal"
          />
          {user.role === "provider" && (
            <EditProfileModal
              visible={isEditProfessionalModalVisible}
              onClose={() => setIsEditProfessionalModalVisible(false)}
              profile={profile}
              onUpdate={refetchProfile}
              mode="professional"
            />
          )}
        </>
      )}
    </SafeAreaView>
  );
}

<<<<<<< Updated upstream
=======
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

>>>>>>> Stashed changes
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleText: {
    color: "white",
    fontSize: theme.fontSizes.sm,
    fontWeight: "600",
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: "90%",
    backgroundColor: theme.colors.darkGray,
    borderRadius: 15,
    padding: 15,
    marginTop: 10,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsDivider: {
    width: 1,
    height: '70%',
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
  editButtonText: {
    fontSize: theme.fontSizes.sm,
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
    marginLeft: 28,
    marginTop: 5,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  settingLabel: {
    fontSize: theme.fontSizes.md,
  },
  logoutButton: {
    width: "90%",
    marginTop: 20,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
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
