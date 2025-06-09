import { StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import { theme } from "@/theme/theme";
import { useAuthCtx } from "@/context/Auth";
import { ProviderProfile } from "@/models/ProviderProfile";
import { ProfileError } from "@/components/ProfileError";
import Button from "@/components/ui/Button";
import useLogout from "@/hooks/auth/useLogout";
import ProfileConfigSection from "@/components/ProfileConfigSection";
import useProfile from "@/hooks/useProfile";
import ProfessionalInfoSection from "@/components/ProfessionalInfoSection";
import ProfileHeader from "@/components/ProfileHeader";
import PersonalInfoSection from "./PersonalInfoSection";
import Loader from "@/components/ui/Loader";
import UserStats from "@/components/UserStats";

export default function MyProfile() {
  const { user } = useAuthCtx();
  const logout = useLogout();
  const navigation = useNavigation();
  const [profile, profileState] = useProfile(user, { expand: "specialty" });

  const onLogout = async () => {
    await logout();
    navigation.navigate("Auth", { screen: "SignIn" });
  };

  const goToServiceCreation = () => {
    navigation.navigate("Main", {
      screen: "ServiceEditor",
      params: {},
    });
  };

  if (profileState.status === "loading") {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: "center" }]}>
        <Loader />
      </SafeAreaView>
    );
  }

  if (!profile || profileState.status === "error") {
    return (
      <SafeAreaView style={styles.container}>
        <ProfileError />
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
        <ProfileHeader user={user} editable />

        <UserStats userId={user.id} />

        {user.role === "provider" && (
          <Button
            title="Publicar nuevo servicio"
            style={styles.newServiceButton}
            labelColor={theme.colors.primaryBlue}
            onPress={goToServiceCreation}
          />
        )}

        <PersonalInfoSection user={user} profile={profile} editable />

        {user.role === "provider" && (
          <ProfessionalInfoSection
            providerProfile={profile as ProviderProfile}
            editable
          />
        )}
        <ProfileConfigSection />

        <Button
          title="Cerrar Sesión"
          style={styles.logoutButton}
          labelColor={theme.colors.redError}
          onPress={onLogout}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    alignItems: "center",
    paddingVertical: 18,
    gap: 4,
    width: "100%",
  },
  userName: {
    color: "white",
    fontSize: theme.fontSizes.xl,
    fontFamily: theme.fontFamily.bold,
    textAlign: "center",
    maxWidth: "80%",
  },
  roleContainer: {
    backgroundColor: theme.colors.secondaryBlue,
    paddingHorizontal: 16,
    gap: 5,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 5,
    flexDirection: "row",
    alignItems: "center",
  },
  infoContainer: {
    width: "90%",
    backgroundColor: theme.colors.darkGray,
    borderRadius: 15,
    padding: 26,
    gap: 13,
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  newServiceButton: {
    width: "90%",
    marginTop: 10,
    backgroundColor: theme.colors.darkerGray,
  },
  logoutButton: {
    marginTop: 20,
    width: "90%",
    backgroundColor: theme.colors.darkGray,
  },
});
