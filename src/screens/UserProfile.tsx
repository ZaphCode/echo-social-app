import { StyleSheet, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StaticScreenProps } from "@react-navigation/native";

import { theme } from "@/theme/theme";
import { User } from "@/models/User";
import { ProviderProfile } from "@/models/ProviderProfile";
import { ProfileError } from "@/components/ProfileError";
import useProfile from "@/hooks/useProfile";
import ProfessionalInfoSection from "@/components/ProfessionalInfoSection";
import ProfileHeader from "@/components/ProfileHeader";
import PersonalInfoSection from "./PersonalInfoSection";
import Loader from "@/components/ui/Loader";
import UserStats from "@/components/UserStats";

type Props = StaticScreenProps<{ user: User }>;

export default function UserProfile({ route }: Props) {
  const { user } = route.params;
  const [profile, profileState] = useProfile(user, { expand: "specialty" });

  if (profileState.status === "loading") {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <Loader />
      </View>
    );
  }

  if (!profile || profileState.status === "error") {
    return (
      <View style={styles.container}>
        <ProfileError />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={{ width: "100%" }}
        contentContainerStyle={{ alignItems: "center", paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <ProfileHeader user={user} />
        <UserStats userId={user.id} />
        <PersonalInfoSection user={user} profile={profile} />
        {user.role === "provider" && (
          <ProfessionalInfoSection
            providerProfile={profile as ProviderProfile}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingBottom: 20,
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
});
