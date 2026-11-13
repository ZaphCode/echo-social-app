import { StyleProp, View, ViewStyle } from "react-native";

import useTheme from "@/hooks/useTheme";
import { fonts } from "@/theme/theme";
import StorageImage from "./StorageImage";
import Text from "./Text";

type Props = {
  name?: string;
  path?: string | null;
  size?: number;
  ring?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Round avatar from the `avatars` bucket, with initials as fallback. */
export default function Avatar({ name, path, size = 40, ring, style }: Props) {
  const { colors } = useTheme();
  const initials = (name ?? "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.surface3,
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        },
        ring && { borderWidth: 2, borderColor: colors.accent },
        style,
      ]}
    >
      {path ? (
        <StorageImage
          bucket="avatars"
          path={path}
          style={{ width: "100%", height: "100%" }}
          accessibilityIgnoresInvertColors
        />
      ) : (
        <Text
          color={colors.textMuted}
          style={{ fontFamily: fonts.bold, fontSize: size * 0.38, lineHeight: size * 0.46 }}
        >
          {initials || "?"}
        </Text>
      )}
    </View>
  );
}
