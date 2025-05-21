import { Pressable, StyleSheet, View } from "react-native";
import React from "react";
import { StaticScreenProps, useNavigation } from "@react-navigation/native";
import { Service } from "@/models/Service";
import { theme } from "@/theme/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import Text from "@/components/ui/Text";
import MessageList from "@/components/MessageList";
import { ServiceRequest } from "@/models/ServiceRequest";

type Props = StaticScreenProps<{ request: ServiceRequest }>;

export default function Chatroom({}: Props) {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <Pressable onPress={navigation.goBack}>
        <Text fontFamily="regular" size={theme.fontSizes.lg} color="white">
          ←
        </Text>
      </Pressable>
      <Text fontFamily="bold" size={theme.fontSizes.xxl} color="white">
        Chatroom
      </Text>
      <View>
        <MessageList />
      </View>
      <View></View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
});
