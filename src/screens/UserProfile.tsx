import { ScrollView, StyleSheet, View } from "react-native";
import { StaticScreenProps } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ProviderProfileWithCategory } from "@/api/types";
import PersonalInfoSection from "@/components/PersonalInfoSection";
import ProfessionalInfoSection from "@/components/ProfessionalInfoSection";
import { ProfileError } from "@/components/ProfileError";
import ProfileHeader from "@/components/ProfileHeader";
import Loader from "@/components/ui/Loader";
import useProfile from "@/hooks/useProfile";
import useTheme from "@/hooks/useTheme";
import { User } from "@/models/User";
import { space } from "@/theme/theme";

type Props = StaticScreenProps<{ user: User }>;

export default function UserProfile({ route }: Props) {
  const { user } = route.params;
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [profile, profileState] = useProfile(user);

  if (profileState.status === "loading" || !profile || profileState.status === "error") {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        {profileState.status === "loading" ? <Loader /> : <ProfileError />}
      </View>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + space.xl }]}
      showsVerticalScrollIndicator={false}
    >
      <ProfileHeader user={user} />
      {user.role === "provider" && (
        <ProfessionalInfoSection providerProfile={profile as ProviderProfileWithCategory} />
      )}
      <PersonalInfoSection user={user} profile={profile} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
  },
  content: {
    paddingHorizontal: space.gutter,
    paddingTop: space.xs,
    gap: space.lg,
  },
});
