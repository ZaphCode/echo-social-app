import { View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  profilesKeys,
  updateProfileAvatar,
} from "@/api/profiles";
import { uploadAvatarImage } from "@/api/storage";
import Text from "@/components/ui/Text";
import { theme } from "@/theme/theme";
import AvatarPicker from "@/components/forms/AvatarPicker";
import { User } from "@/models/User";
import useColorScheme from "@/hooks/useColorScheme";

interface Props {
  user: User;
  editable?: boolean;
}

export default function ProfileHeader({ user, editable }: Props) {
  const { colors } = useColorScheme();
  const queryClient = useQueryClient();
  const [avatar, setAvatar] = useState(user.avatar);
  const avatarMutation = useMutation({
    mutationFn: async (imgSrc: string) => {
      const avatarPath = await uploadAvatarImage(user.id, imgSrc);
      return updateProfileAvatar(user.id, avatarPath);
    },
    onSuccess: (updatedUser) => {
      setAvatar(updatedUser.avatar);
      queryClient.invalidateQueries({ queryKey: profilesKeys.all });
    },
  });

  useEffect(() => {
    setAvatar(user.avatar);
  }, [user.avatar]);

  const onAvatarChange = async (imgSrc: string) => {
    if (!editable) return;

    try {
      const result = await avatarMutation.mutateAsync(imgSrc);
      console.log("Avatar updated successfully:", result);
    } catch (error) {
      console.error("Error updating avatar:", error);
      return;
    }
  };

  return (
    <View style={styles.header}>
      <AvatarPicker
        image={avatar || undefined}
        onChange={onAvatarChange}
        viewOnly={!editable}
        bucket="avatars"
      />
      <Text fontFamily="bold" color={colors.text} style={styles.userName}>
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
