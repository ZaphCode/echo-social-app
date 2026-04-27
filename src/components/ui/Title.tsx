import { StyleSheet, TouchableOpacity, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import useColorScheme from "@/hooks/useColorScheme";

import { theme } from "@/theme/theme";
import Text from "./Text";

type Props = {
  title: string;
  onRefresh?: () => void;
};

export default function Title({ title, onRefresh }: Props) {
  const { colors } = useColorScheme();

  return (
    <View style={styles.container}>
      <Text fontFamily="bold" color={colors.text} size={theme.fontSizes.xxl}>
        {title}
      </Text>
      <TouchableOpacity onPress={onRefresh}>
        <MaterialCommunityIcons name="reload" size={30} color={colors.text} />
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
