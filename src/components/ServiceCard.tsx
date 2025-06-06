import { View, Image, StyleSheet, Dimensions, Pressable } from "react-native";
import React from "react";
import Text from "./ui/Text";
import { Service } from "@/models/Service";
import { Feather } from "@expo/vector-icons";
import { theme } from "@/theme/theme";
import { getFileUrl } from "@/utils/format";
import { useNavigation } from "@react-navigation/native";
import { User } from "@/models/User";

const DEVICE_WIDTH = Dimensions.get("window").width;

type Props = {
  authUser: User;
  service: Service;
};

export default function ServiceCard({ service, authUser }: Props) {
  const navigation = useNavigation();

  const isOwnerProvider = authUser.id === service.provider;

  const handlePress = () => {
    navigation.navigate("Main", {
      screen: "Tabs",
      params: {
        screen: "Home",
        params: {
          screen: "ServiceOverview",
          params: { service },
        },
      },
    });
  };

  return (
    <Pressable onPress={handlePress} style={[styles.card]}>
      <Image
        source={{
          uri:
            getFileUrl("service", service.id, service.photos[0]) ||
            "https://via.placeholder.com/300",
        }}
        style={styles.image}
      />
      {isOwnerProvider && (
        <Pressable
          style={styles.editButton}
          onPress={() =>
            navigation.navigate("Main", {
              screen: "ServiceEditor",
              params: { serviceToEdit: service },
            })
          }
        >
          <Text color={theme.colors.primaryBlue}>Edit</Text>
          <Feather name="edit" size={18} color={theme.colors.primaryBlue} />
        </Pressable>
      )}

      <View style={styles.info}>
        <Text style={styles.title}>{service.name}</Text>
        <View style={styles.footer}>
          <View style={styles.userRow}>
            {isOwnerProvider ? (
              <>
                <Feather
                  name="user"
                  size={14}
                  color={theme.colors.primaryBlue}
                />
                <Text color={theme.colors.primaryBlue} style={styles.username}>
                  Tú
                </Text>
              </>
            ) : (
              <>
                <Feather name="user" size={14} color={theme.colors.lightGray} />
                <Text style={styles.username}>
                  {service.expand!.provider.name}
                </Text>
              </>
            )}
          </View>
          <Text style={styles.price}>{"$" + service.base_price}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    backgroundColor: theme.colors.darkerGray,
    overflow: "hidden",
    width: DEVICE_WIDTH * 0.89,
  },
  image: {
    width: "100%",
    height: 200,
  },
  info: {
    padding: theme.spacing.lg,
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
    fontFamily: theme.fontFamily.regular,
    fontSize: theme.fontSizes.sm,
  },
  price: {
    color: theme.colors.primaryBlue,
    fontSize: theme.fontSizes.md,
  },
  editButton: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    top: 10,
    right: 10,
    backgroundColor: theme.colors.secondaryBlue,
    padding: theme.spacing.sm,
    borderRadius: 50,
  },
});
