import { StyleSheet, View } from "react-native";

import { useNegotiationCtx } from "@/context/Negotiation";
import useTheme from "@/hooks/useTheme";
import { ServiceRequest } from "@/models/ServiceRequest";
import { User } from "@/models/User";
import { radius } from "@/theme/theme";
import { formatDateLong, formatPrice } from "@/utils/format";
import Avatar from "./ui/Avatar";
import Text from "./ui/Text";

type Props = {
  client: User;
  provider: User;
  request: ServiceRequest;
};

export default function RequestDetails({ client, provider, request }: Props) {
  const { colors } = useTheme();
  const { subject } = useNegotiationCtx();
  const clientLabel = subject.type === "contracting" ? "Publicó" : "Cliente";

  return (
    <View style={styles.container}>
      <Text variant="title">Detalles de la solicitud</Text>
      <View style={styles.people}>
        <Person label={clientLabel} user={client} />
        <Person label="Profesional" user={provider} />
      </View>
      <View style={[styles.box, { backgroundColor: colors.surface2 }]}>
        <Row label={subject.type === "contracting" ? "Contratación" : "Servicio"} value={subject.name} />
        <Row label="Precio base" value={formatPrice(subject.base_price)} />
        <Row label="Solicitada" value={formatDateLong(request.requested)} />
      </View>
      <View style={styles.notes}>
        <Text variant="label" bold tone="muted">
          Notas
        </Text>
        <Text tone={request.notes?.trim() ? "default" : "subtle"}>
          {request.notes?.trim() || "Sin notas"}
        </Text>
      </View>
    </View>
  );
}

function Person({ label, user }: { label: string; user: User }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.person, { backgroundColor: colors.surface2 }]}>
      <Avatar name={user.name} path={user.avatar} size={48} />
      <Text variant="caption" tone="subtle">
        {label}
      </Text>
      <Text variant="label" bold numberOfLines={1}>
        {user.name || "—"}
      </Text>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text variant="label" tone="muted">
        {label}
      </Text>
      <Text variant="label" bold numberOfLines={1} style={styles.rowValue}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  people: {
    flexDirection: "row",
    gap: 10,
  },
  person: {
    flex: 1,
    alignItems: "center",
    gap: 4,
    padding: 14,
    borderRadius: radius.card,
  },
  box: {
    borderRadius: radius.card,
    padding: 14,
    gap: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  rowValue: {
    flexShrink: 1,
    textAlign: "right",
  },
  notes: {
    gap: 4,
  },
});
