import { Platform, Pressable, StyleSheet, View } from "react-native";
import { Image } from "expo-image";

import { theme } from "@/theme/theme";
import { useNavigation } from "@react-navigation/native";
import { Fontisto } from "@expo/vector-icons";
import { getFileUrl } from "@/utils/format";
import { SlideModal } from "./ui/SlideModal";
import Text from "./ui/Text";
import useModal from "@/hooks/useModal";
import RequestDetails from "./RequestDetails";
import { useNegotiationCtx } from "@/context/Negotiation";

export default function ChatHeader() {
  const { request, client, provider, service } = useNegotiationCtx();
  const navigation = useNavigation();
  const [modalVisible, openModal, closeModal] = useModal();

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
      <Pressable onPress={openModal} style={styles.infoIconContainer}>
        <Fontisto name="move-h" size={16} color="white" />
      </Pressable>
      <SlideModal visible={modalVisible} onClose={closeModal}>
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
    paddingTop: Platform.OS === "android" ? 16 : 0,
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  },
  image: {
    width: 45,
    height: 45,
    borderRadius: 25,
  },
  serviceNameText: {
    maxWidth: 240,
  },
  infoIconContainer: {
    backgroundColor: theme.colors.darkGray,
    padding: 8,
    borderRadius: 20,
    marginLeft: "auto",
  },
});
