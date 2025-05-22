import { Pressable, StyleSheet, View } from "react-native";
import React from "react";
import Text from "./ui/Text";
import { theme } from "@/theme/theme";
import { Service } from "@/models/Service";
import { useNavigation } from "@react-navigation/native";
import { Fontisto } from "@expo/vector-icons";
import { Image } from "expo-image";
import { getFileUrl } from "@/utils/format";

type Props = {
  service: Service;
};

export default function ChatHeader({ service }: Props) {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Pressable onPress={navigation.goBack}>
        <Fontisto name="caret-left" size={24} color="white" />
      </Pressable>

      <Image
        source={{
          uri:
            getFileUrl("service", service.id, service.photos[0]) ||
            "https://via.placeholder.com/300",
        }}
        style={styles.image}
      />

      <View>
        <Text
          style={styles.serviceNameText}
          fontFamily="bold"
          size={theme.fontSizes.md + 1}
          color="white"
          numberOfLines={1}
        >
          {service.name}
        </Text>
        <Text>{`$${service.base_price}`}</Text>
      </View>
      <View></View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: theme.spacing.md,
  },
  image: {
    width: 45,
    height: 45,
    borderRadius: 25,
  },
  serviceNameText: {
    maxWidth: 250,
  },
});
