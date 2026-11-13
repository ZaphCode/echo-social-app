import { useEffect } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ProviderProfileWithCategory } from "@/api/types";
import PersonalInfoSection from "@/components/PersonalInfoSection";
import ProfessionalInfoSection from "@/components/ProfessionalInfoSection";
import ProfileConfigSection from "@/components/ProfileConfigSection";
import { ProfileError } from "@/components/ProfileError";
import ProfileHeader from "@/components/ProfileHeader";
import Button from "@/components/ui/Button";
import Loader from "@/components/ui/Loader";
import Text from "@/components/ui/Text";
import { useAuthCtx } from "@/context/Auth";
import useLogout from "@/hooks/auth/useLogout";
import useProfile from "@/hooks/useProfile";
import useTheme from "@/hooks/useTheme";
import { space, TAB_BAR_SPACE } from "@/theme/theme";
import { ECHO_VERSION } from "@/utils/constants";

export default function MyProfile() {
  const { user } = useAuthCtx();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const logout = useLogout();
  const [profile, profileState] = useProfile(user);

  useEffect(() => {
    if (profileState.status === "error") logout();
  }, [profileState.status]);

  if (profileState.status === "loading") {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <Loader />
      </View>
    );
  }

  if (!profile || profileState.status === "error") {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <ProfileError />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + space.md, paddingBottom: TAB_BAR_SPACE + insets.bottom },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <ProfileHeader user={user} editable />
      <PersonalInfoSection user={user} profile={profile} editable />
      {user.role === "provider" && (
        <ProfessionalInfoSection
          providerProfile={profile as ProviderProfileWithCategory}
          userId={user.id}
          editable
        />
      )}
      <ProfileConfigSection />
      <Button title="Cerrar sesión" icon="log-out" variant="danger" onPress={logout} />
      <Text variant="caption" tone="subtle" align="center">
        {`Echo v${ECHO_VERSION}`}
      </Text>
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
    gap: space.lg,
  },
});
