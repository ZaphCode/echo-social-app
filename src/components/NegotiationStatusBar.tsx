import { View } from "react-native";

import { theme } from "@/theme/theme";
import { useNegotiationCtx } from "@/context/Negotiation";
import * as NS from "@/utils/negotiation";
import Text from "./ui/Text";

export default function NegotiationStatusBar() {
  const { request } = useNegotiationCtx();

  if (NS.isAccepted(request) || NS.bothAgreed(request)) {
    return (
      <StatusBar title="Trato Aceptado" color={theme.colors.successGreen} />
    );
  }

  if (NS.isCanceled(request) || NS.bothRejected(request)) {
    return (
      <StatusBar title="Solicitud Cancelada" color={theme.colors.redError} />
    );
  }

  if (NS.isFinished(request) || NS.bothMarkedCompleted(request)) {
    return (
      <StatusBar
        title="Servicio Completado!"
        color={theme.colors.completePurple}
      />
    );
  }

  return null;
}

function StatusBar({ title, color }: { title: string; color: string }) {
  return (
    <View style={{ padding: 3, backgroundColor: color }}>
      <Text style={{ color: "white", textAlign: "center" }}>{title}</Text>
    </View>
  );
}
