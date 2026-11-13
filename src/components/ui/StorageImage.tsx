import { Image, ImageProps } from "expo-image";
import { StyleProp, View, ViewStyle } from "react-native";
import { Feather } from "@expo/vector-icons";

import { resolveStorageUrl } from "@/api/storage";
import useTheme from "@/hooks/useTheme";

type Props = Omit<ImageProps, "source"> & {
  bucket?: string;
  path?: string | null;
  style?: StyleProp<ViewStyle>;
};

/** Image from a Supabase bucket (or a local/remote URI) with a themed placeholder. */
export default function StorageImage({
  bucket,
  path,
  style,
  contentFit = "cover",
  transition = 180,
  cachePolicy = "memory-disk",
  ...rest
}: Props) {
  const { colors } = useTheme();
  const uri = path?.trim() ? (bucket ? resolveStorageUrl(bucket, path) : path) : "";

  if (!uri) {
    return (
      <View
        style={[
          { backgroundColor: colors.surface2, alignItems: "center", justifyContent: "center" },
          style,
        ]}
      >
        <Feather name="image" size={22} color={colors.textSubtle} />
      </View>
    );
  }

  return (
    <Image
      {...rest}
      source={{ uri }}
      style={[{ backgroundColor: colors.surface2 }, style]}
      contentFit={contentFit}
      transition={transition}
      cachePolicy={cachePolicy}
    />
  );
}
