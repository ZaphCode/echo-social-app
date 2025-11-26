import useColorScheme from "@/hooks/useColorScheme";
import { View } from "react-native";

type Props = {
  my?: number;
  size?: number;
};

export default function Divider({ my, size }: Props) {
  const { colors } = useColorScheme();
  return (
    <View
      style={{
        height: size || 1,
        backgroundColor: colors.lightGray,
        width: "100%",
        marginVertical: my || 10,
      }}
    ></View>
  );
}
