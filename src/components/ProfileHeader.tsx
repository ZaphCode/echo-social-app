import { View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import Text from "@/components/ui/Text";
import { theme } from "@/theme/theme";
import AvatarPicker from "@/components/forms/AvatarPicker";
import { getFileUrl } from "@/utils/format";
import { User } from "@/models/User";

interface Props {
  user: User;
  editable?: boolean;
}

export default function ProfileHeader({ user, editable }: Props) {
  return (
    <View style={styles.header}>
      <AvatarPicker
        image={user.avatar && getFileUrl("users", user.id, user.avatar)}
        onChange={(img) => console.log("Avatar changed:", img)}
        viewOnly={!editable}
      />
      <Text fontFamily="bold" color="white" style={styles.userName}>
        {user.name}
      </Text>
      <View style={styles.roleContainer}>
        <Feather name="award" size={17} color="white" />
        <Text color="white" size={theme.fontSizes.sm + 1}>
          {user.role === "provider" ? "Profesional" : "Cliente"}
        </Text>
      </View>
    </View>
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
});
