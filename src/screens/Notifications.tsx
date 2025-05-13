import React from "react";
import { StyleSheet, View, FlatList, TouchableOpacity } from "react-native";
import { theme } from "@/theme/theme";
import Text from "@/components/ui/Text";
import { SafeAreaView } from "react-native-safe-area-context";
import Notification, { NotificationData } from "@/components/Notification";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";


const mockNotifications: NotificationData[] = [
  {
    id: "1",
    type: "application",
    user: {
      name: "María García",
      avatar: "https://via.placeholder.com/40",
    },
    content: "se postuló a tu trabajo",
    job: "Diseño de logo para mi emprendimiento",
    status: "pending",
    time: "2m",
  },
  {
    id: "2",
    type: "offer",
    user: {
      name: "Juan Pérez",
      avatar: "https://via.placeholder.com/40",
    },
    content: "te ofreció un trabajo",
    job: "Desarrollo de app móvil",
    budget: "$500",
    time: "15m",
  },
  {
    id: "3",
    type: "message",
    user: {
      name: "Ana Martínez",
      avatar: "https://via.placeholder.com/40",
    },
    content: "te envió un mensaje sobre tu trabajo",
    job: "Edición de video promocional",
    message: "¿Está disponible para una reunión mañana?",
    time: "1h",
  },
  {
    id: "4",
    type: "status",
    user: {
      name: "Carlos López",
      avatar: "https://via.placeholder.com/40",
    },
    content: "aceptó tu oferta de trabajo",
    job: "Fotografía de producto",
    status: "accepted",
    time: "2h",
  },
  {
    id: "5",
    type: "review",
    user: {
      name: "Laura Sánchez",
      avatar: "https://via.placeholder.com/40",
    },
    content: "te dejó una reseña",
    job: "Diseño de tarjetas de presentación",
    rating: 5,
    time: "3h",
  },
];

export default function Notifications() {
  const navigation = useNavigation();

  const handleNotificationPress = (notification: NotificationData) => {

    switch (notification.type) {
      case "application":

        console.log("1");
        break;
      case "offer":

        console.log("2");
        break;
      case "message":

        console.log("3");
        break;
      case "status":

        console.log("4");
        break;
      case "review":

        console.log("5");
        break;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text fontFamily="bold" color="white" size={theme.fontSizes.xl}>
          Notificaciones
        </Text>
        <View style={styles.backButton} />
      </View>
      <FlatList
        data={mockNotifications}
        renderItem={({ item }) => (
          <Notification
            data={item}
            onPress={() => handleNotificationPress(item)}
          />
        )}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.darkGray,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: theme.spacing.sm,
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.darkGray,
    marginVertical: theme.spacing.sm,
  },
}); 