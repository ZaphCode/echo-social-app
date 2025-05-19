import { theme } from "@/theme/theme";
import { View, Text } from "react-native";

type Props = {
  my?: number;
  size?: number;
};

export default function Divider({ my, size }: Props) {
  return (
    <View
      style={{
        height: size || 1,
        backgroundColor: theme.colors.darkGray,
        width: "100%",
        marginVertical: my || 10,
      }}
    ></View>
  );
}
