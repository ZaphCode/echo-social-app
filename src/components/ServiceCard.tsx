import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  Pressable,
  Alert,
} from "react-native";
import React from "react";
import Text from "./ui/Text";
import { Service } from "@/models/Service";
import { Feather } from "@expo/vector-icons";
import { theme } from "@/theme/theme";
import { getFileUrl } from "@/utils/files";
import { useNavigation } from "@react-navigation/native";

const DEVICE_WIDTH = Dimensions.get("window").width;

type Props = {
  service: Service;
};

export default function ServiceCard({ service }: Props) {
  const navigation = useNavigation();

  const handlePress = () => {
    navigation.navigate("Main", {
      screen: "Home",
      params: {
        screen: "ServiceOverview",
        params: { service },
      },
    });
  };

  return (
    <Pressable onPress={handlePress} style={styles.card}>
      <Image
        source={{
          uri:
            getFileUrl("service", service.id, service.photos[0]) ||
            "https://via.placeholder.com/300",
        }}
        style={styles.image}
      />
      <View style={styles.info}>
        <Text style={styles.title}>{service.name}</Text>
        <View style={styles.footer}>
          <View style={styles.userRow}>
            <Feather name="user" size={14} color={theme.colors.lightGray} />
            <Text style={styles.username}>{service.expand!.provider.name}</Text>
          </View>
          <Text style={styles.price}>{"$" + service.base_price}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.darkerGray,
    borderRadius: 16,
    overflow: "hidden",

    width: DEVICE_WIDTH * 0.87,
  },
  image: {
    width: "100%",
    height: 200,
  },
  info: {
    padding: theme.spacing.md,
  },
  title: {
    color: "#fff",
    fontFamily: theme.fontFamily.bold,
    fontSize: theme.fontSizes.md,
    marginBottom: 8,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  username: {
    color: theme.colors.lightGray,
    fontFamily: theme.fontFamily.regular,
    fontSize: theme.fontSizes.sm,
  },
  price: {
    color: theme.colors.primaryBlue,
    fontSize: theme.fontSizes.md,
  },
});
