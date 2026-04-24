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
import { useEffect } from "react";
import useColorScheme from "@/hooks/useColorScheme";

export default function MyProfile() {
  const { user } = useAuthCtx();
  const logout = useLogout();
  const navigation = useNavigation();
  const { colors } = useColorScheme();
  const [profile, profileState] = useProfile(user, { 
    select: user.role === "provider" ? "*, service_category:service_category!specialty(*)" : "*" 
  });

  const containerStyle = {
    flex: 1,
    backgroundColor: colors.background,
  };

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

  useEffect(() => {
    if (profileState.status === "error") onLogout();
  }, [profileState.status]);

  if (profileState.status === "loading") {
    return (
      <SafeAreaView style={[containerStyle, { justifyContent: "center" }]}>
        <Loader />
      </SafeAreaView>
    );
  }

  if (!profile || profileState.status === "error") {
    return (
      <SafeAreaView style={containerStyle}>
        <ProfileError />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={containerStyle}>
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
            style={[
              styles.newServiceButton,
              { backgroundColor: colors.darkerGray },
            ]}
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
          style={[styles.logoutButton, { backgroundColor: colors.darkGray }]}
          labelColor={theme.colors.redError}
          onPress={onLogout}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  newServiceButton: {
    width: "90%",
    marginTop: 10,
  },
  logoutButton: {
    marginTop: 20,
    width: "90%",
  },
});
