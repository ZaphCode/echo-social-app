import { StyleSheet, View } from "react-native";

import { theme } from "@/theme/theme";
import { Feather } from "@expo/vector-icons";
import Text from "./ui/Text";
import useStats from "@/hooks/useStats";

type Props = { userId: string };

export default function UserStats({ userId }: Props) {
  const { rating, reviewsCount, requestsDone } = useStats(userId);

  return (
    <View style={styles.block}>
      <View style={styles.numbersRow}>
        <StatBox label="Reseñas" value={reviewsCount} icon="award" />
        <StatBox
          label="Servicios"
          value={requestsDone}
          icon="check-circle"
          iconColor={theme.colors.successGreen}
        />
        <StatBox
          label="Calif."
          value={typeof rating === "number" ? rating.toFixed(1) : "-"}
          icon="star"
          iconColor="#ffc700"
        />
      </View>
    </View>
  );
}

function StatBox({
  label,
  value,
  icon,
  iconColor,
}: {
  label: string;
  value: string | number;
  icon: keyof typeof Feather.glyphMap;
  iconColor?: string;
}) {
  return (
    <View style={styles.statBox}>
      <Feather
        name={icon}
        size={28}
        color={iconColor || theme.colors.primaryBlue}
      />
      <Text
        fontFamily="bold"
        color="white"
        size={theme.fontSizes.lg + 5}
        style={{ marginLeft: 4 }}
      >
        {`${value}`}
      </Text>
      <Text color={theme.colors.lightGray} size={theme.fontSizes.md}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    backgroundColor: theme.colors.darkerGray,
    borderRadius: 16,
    padding: 20,
    width: "90%",
    marginTop: 20,
    marginBottom: 8,
    gap: 0,
  },
  numbersRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 6,
    marginBottom: 4,
  },
  statBox: {
    alignItems: "center",
    gap: 2,
    flex: 1,
  },
});
