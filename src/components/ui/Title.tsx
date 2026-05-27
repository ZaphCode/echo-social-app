import { StyleSheet, TouchableOpacity, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import useColorScheme from "@/hooks/useColorScheme";

import { theme } from "@/theme/theme";
import Text from "./Text";
import { useOffline } from "@/context/Offline";

type Props = {
  title: string;
  onRefresh?: () => void;
};

export default function Title({ title, onRefresh }: Props) {
  const { colors } = useColorScheme();
  const { isOnline } = useOffline();
  const iconName = isOnline ? "reload" : "cloud-off-outline";

  return (
    <View style={styles.container}>
      <Text fontFamily="bold" color={colors.text} size={theme.fontSizes.xxl}>
        {title}
      </Text>
      <TouchableOpacity
        onPress={isOnline ? onRefresh : undefined}
        disabled={!isOnline || !onRefresh}
      >
        <MaterialCommunityIcons
          name={iconName}
          size={30}
          color={isOnline ? colors.text : colors.lightGray}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
