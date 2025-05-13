import { Image, ScrollView, StyleSheet, Dimensions } from "react-native";
import { getFileUrl } from "@/utils/files";

const { width } = Dimensions.get("window");

type Props = {
  photos: string[];
  serviceId: string;
};

export default function ServicePhotoCarousel({ photos, serviceId }: Props) {
  const formatted = photos.map((p) => getFileUrl("service", serviceId, p));

  return (
    <ScrollView
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      style={styles.wrapper}
    >
      {formatted.map((uri, index) => (
        <Image key={index} source={{ uri }} style={styles.image} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 24,
  },
  image: {
    width: width * 0.9,
    height: 240,
    resizeMode: "cover",
    borderRadius: 16,
    marginHorizontal: 10,
  },
});
