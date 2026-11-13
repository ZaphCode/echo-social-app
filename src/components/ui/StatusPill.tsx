import { StyleSheet, View } from "react-native";

import useTheme from "@/hooks/useTheme";
import { ServiceRequest } from "@/models/ServiceRequest";
import { ThemeColors } from "@/theme/theme";
import Text from "./Text";

type AgreementState = ServiceRequest["agreement_state"];

export const AGREEMENT_STATES: Record<
  AgreementState,
  { label: string; color: keyof ThemeColors; soft: keyof ThemeColors }
> = {
  NEGOTIATION: { label: "Negociación", color: "accentText", soft: "accentSoft" },
  ACCEPTED: { label: "Aceptado", color: "success", soft: "successSoft" },
  CANCELED: { label: "Cancelado", color: "danger", soft: "dangerSoft" },
  FINISHED: { label: "Finalizado", color: "done", soft: "doneSoft" },
};

type Props = { state: AgreementState };

/** Request state: always color + text, never color alone. */
export default function StatusPill({ state }: Props) {
  const { colors } = useTheme();
  const meta = AGREEMENT_STATES[state] ?? AGREEMENT_STATES.NEGOTIATION;
  const color = colors[meta.color];

  return (
    <View style={[styles.pill, { backgroundColor: colors[meta.soft] }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text variant="caption" bold color={color}>
        {meta.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    height: 26,
    borderRadius: 13,
    alignSelf: "flex-start",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
