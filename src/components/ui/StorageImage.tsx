import { Image, ImageProps } from "expo-image";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

import { resolveStorageUrl } from "@/api/storage";

type Props = Omit<ImageProps, "source"> & {
  bucket?: string;
  path?: string | null;
  fallbackUri?: string;
  style?: StyleProp<ViewStyle>;
};

export default function StorageImage({
  bucket,
  path,
  fallbackUri,
  style,
  contentFit = "cover",
  transition = 180,
  cachePolicy = "memory-disk",
  ...rest
}: Props) {
  const resolvedUri = resolveImageUri({ bucket, path, fallbackUri });

  if (!resolvedUri) {
    return <View style={[styles.placeholder, style]} />;
  }

  return (
    <Image
      {...rest}
      source={{ uri: resolvedUri }}
      style={style}
      contentFit={contentFit}
      transition={transition}
      cachePolicy={cachePolicy}
    />
  );
}

function resolveImageUri({
  bucket,
  path,
  fallbackUri,
}: {
  bucket?: string;
  path?: string | null;
  fallbackUri?: string;
}) {
  if (path?.trim()) {
    return bucket ? resolveStorageUrl(bucket, path) : path;
  }

  if (fallbackUri?.trim()) {
    return fallbackUri;
  }

  return "";
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: "#2A2D31",
  },
});
