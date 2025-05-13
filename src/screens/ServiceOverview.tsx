import { StyleSheet, ScrollView, View } from "react-native";
import { StaticScreenProps } from "@react-navigation/native";

import { theme } from "@/theme/theme";
import Text from "@/components/ui/Text";
import { Service } from "@/models/Service";
import ServicePhotoCarousel from "@/components/ServicePhotoCarousel";

type Props = StaticScreenProps<{ service: Service }>;

export default function ServiceOverview({ route }: Props) {
  const { service } = route.params;

  return (
    <ScrollView style={styles.container}>
      <ServicePhotoCarousel photos={service.photos} serviceId={service.id} />
      <View style={{ paddingHorizontal: theme.spacing.sm }}>
        <Text color="white" fontFamily="bold" size={theme.fontSizes.xl}>
          {service.name}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.sm,
  },
});
