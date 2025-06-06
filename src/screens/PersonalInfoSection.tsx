import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";

import { theme } from "@/theme/theme";
import { User } from "@/models/User";
import { ProviderProfile } from "@/models/ProviderProfile";
import { ClientProfile } from "@/models/ClientProfile";
import { SlideModal } from "@/components/ui/SlideModal";
import InfoRow from "@/components/InfoRow";
import Text from "@/components/ui/Text";
import EditProfileView from "@/components/EditProfileView";
import useModal from "@/hooks/useModal";

interface Props {
  user: User;
  profile: ClientProfile | ProviderProfile;
  editable?: boolean;
}

export default function PersonalInfoSection({
  user,
  profile,
  editable,
}: Props) {
  const [modalVisible, openModal, closeModal] = useModal();

  return (
    <View style={styles.infoContainer}>
      <View style={styles.sectionHeader}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Feather name="user" size={16} color={theme.colors.primaryBlue} />
          <Text fontFamily="bold" color="white" size={theme.fontSizes.lg - 2.5}>
            Información Personal
          </Text>
        </View>
        {editable && (
          <Pressable style={styles.editButton} onPress={openModal}>
            <Feather name="edit-2" size={18} color={theme.colors.primaryBlue} />
            <Text
              color={theme.colors.primaryBlue}
              style={styles.editButtonText}
            >
              Editar
            </Text>
          </Pressable>
        )}
      </View>
      <InfoRow icon="mail" label="Email" value={user.email} />
      <InfoRow icon="phone" label="Teléfono" value={profile.phone} />
      <InfoRow
        icon="map-pin"
        label="Dirección"
        value={`${profile.address}, ${profile.city}, ${profile.state}, CP ${profile.zip}`}
      />
      {editable && (
        <SlideModal visible={modalVisible} onClose={closeModal}>
          <EditProfileView profile={profile} />
        </SlideModal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  infoContainer: {
    width: "90%",
    backgroundColor: theme.colors.darkerGray,
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
  editButton: { flexDirection: "row", alignItems: "center", gap: 5 },
  editButtonText: { fontSize: theme.fontSizes.sm, fontWeight: "600" },
});
