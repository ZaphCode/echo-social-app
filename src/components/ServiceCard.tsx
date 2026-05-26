import { View, StyleSheet, Dimensions, Pressable } from "react-native";
import React from "react";
import Text from "./ui/Text";
import { ServiceWithProvider } from "@/api/types";
import { AntDesign, Feather } from "@expo/vector-icons";
import { theme } from "@/theme/theme";
import { useNavigation } from "@react-navigation/native";
import { User } from "@/models/User";
import useColorScheme from "@/hooks/useColorScheme";
import StorageImage from "./ui/StorageImage";
import { formatRelativeDate } from "@/utils/format";
import { useQuery } from "@tanstack/react-query";
import { getServiceReviewSummary, reviewsKeys } from "@/api/reviews";

const DEVICE_WIDTH = Dimensions.get("window").width;

type Props = {
  authUser: User;
  service: ServiceWithProvider;
};

export default function ServiceCard({ service, authUser }: Props) {
  const navigation = useNavigation();
  const isOwnerProvider = authUser.id === service.provider;
  const reviewSummaryQuery = useQuery({
    queryKey: reviewsKeys.serviceSummary(service.id),
    queryFn: () => getServiceReviewSummary(service.id),
    staleTime: 1000 * 60 * 5,
  });
  const reviewSummary = reviewSummaryQuery.data;

  const handlePress = () => {
    (navigation.navigate as any)("Main", {
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

  const { colors } = useColorScheme();

  return (
    <Pressable
      onPress={handlePress}
      style={[styles.card, { backgroundColor: colors.darkerGray }]}
    >
      <StorageImage
        bucket="service-photos"
        path={service.photos?.[0]}
        fallbackUri="https://via.placeholder.com/300"
        style={styles.image}
      />
      {isOwnerProvider && (
        <Pressable
          style={styles.editButton}
          onPress={() =>
            (navigation.navigate as any)("Main", {
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
        <Text color={colors.text} style={styles.title}>
          {service.name}
        </Text>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Feather name="clock" size={13} color={colors.lightGray} />
            <Text color={colors.lightGray} size={theme.fontSizes.sm}>
              {formatRelativeDate(service.created_at)}
            </Text>
          </View>
          {reviewSummary && reviewSummary.count > 0 ? (
            <View style={styles.metaItem}>
              <AntDesign
                name="star"
                size={13}
                color={theme.colors.primaryBlue}
              />
              <Text color={colors.lightGray} size={theme.fontSizes.sm}>
                {`${reviewSummary.average.toFixed(1)} (${reviewSummary.count})`}
              </Text>
            </View>
          ) : null}
        </View>
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
                <Feather name="user" size={14} color={colors.lightGray} />
                <Text style={styles.username}>
                  {service.provider_profile?.name || "Proveedor"}
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
    overflow: "hidden",
    width: DEVICE_WIDTH * 0.89,
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowOffset: {
      width: 6,
      height: 6,
    },
  },
  image: {
    width: "100%",
    height: 200,
  },
  info: {
    padding: theme.spacing.lg,
  },
  title: {
    fontFamily: theme.fontFamily.bold,
    fontSize: theme.fontSizes.md,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.sm,
    marginBottom: 10,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  username: {
    fontFamily: theme.fontFamily.regular,
    fontSize: theme.fontSizes.sm,
  },
  price: {
    color: theme.colors.primaryBlue,
    fontSize: theme.fontSizes.md,
    fontFamily: theme.fontFamily.bold,
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
