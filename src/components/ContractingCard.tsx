import { View, StyleSheet, Dimensions, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { ContractingWithOwner } from "@/api/types";
import { User } from "@/models/User";
import { theme } from "@/theme/theme";
import Text from "./ui/Text";
import StorageImage from "./ui/StorageImage";
import useColorScheme from "@/hooks/useColorScheme";
import { formatRelativeDate } from "@/utils/format";

const DEVICE_WIDTH = Dimensions.get("window").width;

type Props = {
  authUser: User;
  contracting: ContractingWithOwner;
};

export default function ContractingCard({ contracting, authUser }: Props) {
  const navigation = useNavigation();
  const { colors } = useColorScheme();
  const isOwner = authUser.id === contracting.owner;
  const showEdit = isOwner && !contracting.is_closed;

  const handlePress = () => {
    (navigation.navigate as any)("Main", {
      screen: "Tabs",
      params: {
        screen: "Home",
        params: {
          screen: "ContractingOverview",
          params: { contracting },
        },
      },
    });
  };

  return (
    <Pressable
      onPress={handlePress}
      style={[styles.card, { backgroundColor: colors.darkerGray }]}
    >
      <StorageImage
        bucket="service-photos"
        path={contracting.photos?.[0]}
        fallbackUri="https://via.placeholder.com/300"
        style={styles.image}
      />
      {showEdit && (
        <Pressable
          style={styles.editButton}
          onPress={() =>
            (navigation.navigate as any)("Main", {
              screen: "ContractingEditor",
              params: { contractingToEdit: contracting },
            })
          }
        >
          <Text color={theme.colors.primaryBlue}>Edit</Text>
          <Feather name="edit" size={18} color={theme.colors.primaryBlue} />
        </Pressable>
      )}

      <View style={styles.info}>
        <Text color={colors.text} style={styles.title}>
          {contracting.name}
        </Text>
        <View style={styles.metaRow}>
          <Feather name="clock" size={13} color={colors.lightGray} />
          <Text color={colors.lightGray} size={theme.fontSizes.sm}>
            {formatRelativeDate(contracting.created_at)}
          </Text>
        </View>
        <View style={styles.footer}>
          <View style={styles.userRow}>
            <Feather
              name="briefcase"
              size={14}
              color={isOwner ? theme.colors.primaryBlue : colors.lightGray}
            />
            <Text
              color={isOwner ? theme.colors.primaryBlue : colors.lightGray}
              style={styles.username}
            >
              {isOwner ? "Tú" : contracting.owner_profile?.name || "Publicador"}
            </Text>
          </View>
          {contracting.is_closed ? (
            <Text style={styles.closed}>Completada</Text>
          ) : (
            <Text style={styles.price}>{"$" + contracting.base_price}</Text>
          )}
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
    gap: 6,
    marginBottom: 10,
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
  closed: {
    color: theme.colors.completePurple,
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
