import { Platform, Pressable, StyleSheet, View } from "react-native";

import { useNavigation } from "@react-navigation/native";
import { Fontisto } from "@expo/vector-icons";
import { SlideModal } from "./ui/SlideModal";
import Text from "./ui/Text";
import useModal from "@/hooks/useModal";
import RequestDetails from "./RequestDetails";
import { useNegotiationCtx } from "@/context/Negotiation";
import { theme } from "@/theme/theme";
import useColorScheme from "@/hooks/useColorScheme";
import StorageImage from "./ui/StorageImage";

export default function ChatHeader() {
  const { colors } = useColorScheme();
  const { request, client, provider, service } = useNegotiationCtx();
  const navigation = useNavigation();
  const [modalVisible, openModal, closeModal] = useModal();

  return (
    <View style={styles.container}>
      <Pressable onPress={navigation.goBack}>
        <Fontisto name="caret-left" size={24} color="white" />
      </Pressable>

      <StorageImage
        bucket="service-photos"
        path={service.photos?.[0]}
        fallbackUri="https://via.placeholder.com/300"
        style={styles.image}
      />

      <View>
        <Text
          style={styles.serviceNameText}
          fontFamily="bold"
          size={theme.fontSizes.md + 1}
          color={colors.text}
          numberOfLines={1}
        >
          {service.name}
        </Text>
        <Text>{`$${service.base_price}`}</Text>
      </View>
      <Pressable
        onPress={openModal}
        style={{
          ...styles.infoIconContainer,
          backgroundColor: colors.darkGray,
        }}
      >
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
    padding: 8,
    borderRadius: 20,
    marginLeft: "auto",
  },
});
