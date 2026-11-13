import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { profilesKeys, updateProfileAvatar } from "@/api/profiles";
import AvatarPicker from "@/components/forms/AvatarPicker";
import Text from "@/components/ui/Text";
import useStats from "@/hooks/useStats";
import useTheme from "@/hooks/useTheme";
import { User } from "@/models/User";
import { radius } from "@/theme/theme";

type Props = {
  user: User;
  editable?: boolean;
};

/** Avatar, name, role and the stats bar (reseñas · trabajos · calificación). */
export default function ProfileHeader({ user, editable }: Props) {
  const { colors } = useTheme();
  const queryClient = useQueryClient();
  const [avatar, setAvatar] = useState(user.avatar);
  const { rating, reviewsCount, requestsDone } = useStats(user.id);

  const avatarMutation = useMutation({
    mutationFn: (uri: string) => updateProfileAvatar(user.id, uri),
    onSuccess: (updatedUser) => {
      setAvatar(updatedUser.avatar);
      queryClient.invalidateQueries({ queryKey: profilesKeys.all });
    },
  });

  useEffect(() => {
    setAvatar(user.avatar);
  }, [user.avatar]);

  const isProvider = user.role === "provider";

  return (
    <View style={styles.container}>
      <AvatarPicker
        image={avatar || undefined}
        onChange={(uri) => editable && avatarMutation.mutate(uri)}
        viewOnly={!editable}
        bucket="avatars"
      />
      <View style={styles.identity}>
        <Text variant="title" align="center">
          {user.name}
        </Text>
        <View style={[styles.role, { backgroundColor: isProvider ? colors.accentSoft : colors.surface2 }]}>
          <Feather name={isProvider ? "tool" : "user"} size={13} color={isProvider ? colors.accentText : colors.textMuted} />
          <Text variant="caption" bold color={isProvider ? colors.accentText : colors.textMuted}>
            {isProvider ? "Profesional" : "Cliente"}
          </Text>
        </View>
      </View>
      <View style={[styles.stats, { backgroundColor: colors.surface, borderColor: colors.line }]}>
        <Stat value={String(reviewsCount ?? 0)} label="Reseñas" />
        <View style={[styles.divider, { backgroundColor: colors.line }]} />
        <Stat value={String(requestsDone ?? 0)} label="Trabajos" />
        <View style={[styles.divider, { backgroundColor: colors.line }]} />
        <Stat
          value={typeof rating === "number" && rating > 0 ? rating.toFixed(1) : "—"}
          label="Calificación"
          star={typeof rating === "number" && rating > 0}
        />
      </View>
    </View>
  );
}

function Stat({ value, label, star }: { value: string; label: string; star?: boolean }) {
  const { colors } = useTheme();
  return (
    <View style={styles.stat}>
      <View style={styles.statValue}>
        {star && <Feather name="star" size={15} color={colors.star} />}
        <Text variant="heading">{value}</Text>
      </View>
      <Text variant="caption" tone="subtle">
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 16,
  },
  identity: {
    alignItems: "center",
    gap: 8,
  },
  role: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 28,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
  },
  stats: {
    alignSelf: "stretch",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: radius.card,
    borderWidth: 1,
  },
  stat: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  statValue: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  divider: {
    width: 1,
    height: 32,
  },
});
