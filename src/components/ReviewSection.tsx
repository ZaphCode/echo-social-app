import { View } from "react-native";
import Text from "./ui/Text";
import { theme } from "@/theme/theme";
import { StaticScreenProps } from "@react-navigation/native";

type Props = StaticScreenProps<{ serviceId: string }>;

export default function ReviewSection() {
  return (
    <View>
      <Text color="white" size={theme.fontSizes.xl + 2} fontFamily="bold">
        Valoraciones
      </Text>
    </View>
  );
}
