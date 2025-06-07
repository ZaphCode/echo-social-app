import { View, StyleSheet } from "react-native";
import { Image } from "expo-image";
import Text from "./ui/Text";
import { theme } from "@/theme/theme";
import { User } from "@/models/User";
import { ServiceRequest } from "@/models/ServiceRequest";
import { formatDateLong, getFileUrl } from "@/utils/format";
import Divider from "./ui/Divider";
import InfoRow from "./InfoRow";

type Props = {
  client: User;
  provider: User;
  request: ServiceRequest;
};

export default function RequestDetails({ client, provider, request }: Props) {
  return (
    <View style={styles.container}>
      {/* Notas */}
      <Text
        fontFamily="bold"
        size={theme.fontSizes.xl}
        color={"white"}
        style={{ marginBottom: 7, textAlign: "center" }}
      >
        Detalles de la solicitud
      </Text>
      <View style={styles.usersRow}>
        <UserMiniCard
          id={client.id}
          label="Cliente"
          name={client.name}
          avatar={client.avatar}
        />
        <View style={styles.userSpacer} />
        <UserMiniCard
          id={provider.id}
          label="Proveedor"
          name={provider.name}
          avatar={provider.avatar}
        />
      </View>
      <Divider />
      <View style={{ paddingHorizontal: theme.spacing.md }}>
        <InfoRow
          label="Notas"
          value={request.notes?.trim() ? request.notes : "Sin notas"}
          icon="file-text"
        />
      </View>
    </View>
  );
}

function UserMiniCard({
  id,
  label,
  name,
  avatar,
}: {
  id: string;
  label: string;
  name: string;
  avatar?: string;
}) {
  return (
    <View style={styles.userCard}>
      <Image
        source={{ uri: getFileUrl("users", id, avatar!) }}
        style={styles.avatar}
      />
      <Text color={theme.colors.lightGray} size={12}>
        {label}
      </Text>
      <Text color="white" numberOfLines={1} style={{ fontWeight: "bold" }}>
        {name}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
    gap: 18,
  },
  notesText: {
    color: theme.colors.lightGray,
    marginBottom: 14,
    fontSize: theme.fontSizes.md,
  },
  datesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    gap: 14,
  },
  dateCol: {
    flex: 1,
    alignItems: "flex-start",
  },
  usersRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  userCard: {
    alignItems: "center",
    gap: 2,
    flex: 1,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    marginBottom: 2,
    backgroundColor: "#DDD",
  },
  userSpacer: {
    width: 24,
  },
});
