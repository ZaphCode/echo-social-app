import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import useColorScheme from "@/hooks/useColorScheme";

import { theme } from "@/theme/theme";
import Text from "./Text";

type Props = {
  title: string;
};

export default function Title({ title }: Props) {
  const { colors } = useColorScheme();
  const queryClient = useQueryClient();

  return (
    <View style={styles.container}>
      <Text fontFamily="bold" color={colors.text} size={theme.fontSizes.xxl}>
        {title}
      </Text>
      <TouchableOpacity onPress={() => queryClient.invalidateQueries()}>
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
