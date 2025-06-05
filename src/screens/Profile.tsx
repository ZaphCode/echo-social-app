import { View, StyleSheet, Pressable, ScrollView } from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { theme } from "@/theme/theme";
import Text from "@/components/ui/Text";
import Button from "@/components/ui/Button";
import useLogout from "@/hooks/auth/useLogout";
import { useNavigation } from "@react-navigation/native";

const userData = {
  nombre: "Omar Urquidez",
  email: "zaph@gmail.com",
  telefono: "+1234567890",
  direccion: "Calle Principal 123",
  role: "Cliente",
  stats: {
    serviciosCompletados: 24,
    calificacion: 4.8,
    miembroDesde: "Enero 2024",
  },
};

export default function Profile() {
  const logout = useLogout();
  const navigation = useNavigation();

  const onLogout = async () => {
    await logout();
    navigation.navigate("Auth", { screen: "SignIn" });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={{ width: "100%" }}
        contentContainerStyle={{ alignItems: "center", paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.imageContainer}>
            <Image
              source={require("@Assets/balde.png")}
              contentFit="fill"
              style={styles.profileImage}
            />
            <Pressable
              style={styles.editImageButton}
              onPress={() => console.log("editar fotillo")}
            >
              <Feather name="camera" size={16} color={theme.colors.lightGray} />
            </Pressable>
          </View>

          <Text fontFamily="bold" color="white" size={theme.fontSizes.xl}>
            {userData.nombre}
          </Text>
          <View style={styles.roleContainer}>
            <Feather
              name="award"
              size={16}
              color="white"
              style={{ marginRight: 5 }}
            />
            <Text style={styles.roleText}>{userData.role}</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <StatBox
            value={userData.stats.serviciosCompletados}
            label="Servicios Completados"
          />
          <View style={styles.statsDivider} />
          <StatBox value={userData.stats.calificacion} label="Calificación" />
          <View style={styles.statsDivider} />
          <StatBox value={userData.stats.miembroDesde} label="Miembro Desde" />
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.sectionHeader}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <Feather name="user" size={20} color={theme.colors.primaryBlue} />
              <Text fontFamily="bold" color="white" size={theme.fontSizes.lg}>
                Información Personal
              </Text>
            </View>
            <Pressable
              style={styles.editButton}
              onPress={() => console.log("editar perfil")}
            >
              <Feather
                name="edit-2"
                size={18}
                color={theme.colors.primaryBlue}
              />
              <Text color="primaryBlue" style={styles.editButtonText}>
                Editar
              </Text>
            </Pressable>
          </View>

          <InfoRow icon="mail" label="Email" value={userData.email} />
          <InfoRow icon="phone" label="Teléfono" value={userData.telefono} />
          <InfoRow
            icon="map-pin"
            label="Dirección"
            value={userData.direccion}
          />
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.sectionHeader}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <Feather
                name="settings"
                size={20}
                color={theme.colors.primaryBlue}
              />
              <Text fontFamily="bold" color="white" size={theme.fontSizes.lg}>
                Configuración
              </Text>
            </View>
          </View>

          <Pressable
            style={styles.settingRow}
            onPress={() => console.log("Notifications")}
          >
            <View style={styles.labelContainer}>
              <Feather name="bell" size={20} color={theme.colors.lightGray} />
              <Text color="white" style={styles.settingLabel}>
                Notificaciones
              </Text>
            </View>
            <Feather
              name="chevron-right"
              size={20}
              color={theme.colors.lightGray}
            />
          </Pressable>

          <Pressable
            style={styles.settingRow}
            onPress={() => console.log("Privacy")}
          >
            <View style={styles.labelContainer}>
              <Feather name="lock" size={20} color={theme.colors.lightGray} />
              <Text color="white" style={styles.settingLabel}>
                Privacidad
              </Text>
            </View>
            <Feather
              name="chevron-right"
              size={20}
              color={theme.colors.lightGray}
            />
          </Pressable>

          <Pressable
            style={styles.settingRow}
            onPress={() => console.log("Help")}
          >
            <View style={styles.labelContainer}>
              <Feather
                name="help-circle"
                size={20}
                color={theme.colors.lightGray}
              />
              <Text color="white" style={styles.settingLabel}>
                Ayuda
              </Text>
            </View>
            <Feather
              name="chevron-right"
              size={20}
              color={theme.colors.lightGray}
            />
          </Pressable>
        </View>

        <Button
          title="Cerrar Sesión"
          style={[
            styles.logoutButton,
            { backgroundColor: theme.colors.darkGray },
          ]}
          onPress={onLogout}
        />
      </ScrollView>
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
      <Text color="lightGray" style={styles.label}>
        {label}
      </Text>
    </View>
    <Text color="white" style={styles.value}>
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
  <View style={styles.statBox}>
    <Text color="white" fontFamily="bold" size={theme.fontSizes.xl}>
      {value.toString()}
    </Text>
    <Text
      color="lightGray"
      size={theme.fontSizes.sm}
      style={{ textAlign: "center" }}
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
  editButtonText: {
    fontSize: theme.fontSizes.sm,
    fontWeight: "600",
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
});
