import { ScrollView, StyleSheet, Dimensions } from "react-native";

import StorageImage from "./ui/StorageImage";

const { width } = Dimensions.get("window");

type Props = {
  photos: string[];
  serviceId: string;
  editing?: boolean;
};

export default function ServicePhotoCarousel({ photos, serviceId }: Props) {
  return (
    <ScrollView
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      style={styles.wrapper}
    >
      {photos.map((path, index) => (
        <StorageImage
          key={`${serviceId}-${index}`}
          bucket="service-photos"
          path={path}
          fallbackUri="https://via.placeholder.com/300"
          style={styles.image}
        />
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
    height: 220,
    resizeMode: "cover",
    borderRadius: 16,
    marginHorizontal: 10,
  },
});
