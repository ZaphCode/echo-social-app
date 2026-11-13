import { StyleSheet, View } from "react-native";

import { useAuthCtx } from "@/context/Auth";
import { useNegotiationCtx } from "@/context/Negotiation";
import useModal from "@/hooks/useModal";
import useAppNavigation from "@/navigation/useAppNavigation";
import RequestDetails from "./RequestDetails";
import Avatar from "./ui/Avatar";
import IconButton from "./ui/IconButton";
import { SlideModal } from "./ui/SlideModal";
import Text from "./ui/Text";

export default function ChatHeader() {
  const { user } = useAuthCtx();
  const { request, client, provider, subject } = useNegotiationCtx();
  const nav = useAppNavigation();
  const [detailsVisible, openDetails, closeDetails] = useModal();
  const counterpart = user.id === client.id ? provider : client;

  return (
    <View style={styles.container}>
      <IconButton icon="chevron-left" accessibilityLabel="Volver" onPress={nav.back} />
      <Avatar name={counterpart.name} path={counterpart.avatar} size={42} />
      <View style={styles.text}>
        <Text bold numberOfLines={1}>
          {counterpart.name || "Usuario"}
        </Text>
        <Text variant="caption" tone="subtle" numberOfLines={1}>
          {subject.name}
        </Text>
      </View>
      <IconButton icon="info" accessibilityLabel="Detalles de la solicitud" onPress={openDetails} />
      <SlideModal visible={detailsVisible} onClose={closeDetails}>
        <RequestDetails client={client} provider={provider} request={request} />
      </SlideModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 12,
  },
  text: {
    flex: 1,
    minWidth: 0,
  },
});
