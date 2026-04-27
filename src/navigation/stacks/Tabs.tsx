import { Platform } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Foundation, MaterialCommunityIcons } from "@expo/vector-icons";

import { IndexStack } from "./Index";
import MyProfile from "@/screens/MyProfile";
import Notifications from "@/screens/Notifications";
import Requests from "@/screens/Requests";
import { theme } from "@/theme/theme";

export const Tabs = createBottomTabNavigator({
  initialRouteName: "Home",
  screenOptions: {
    headerShown: false,
    tabBarStyle: {
      backgroundColor: theme.colors.brandSurface,
      borderTopWidth: 0,
      height: Platform.OS === "ios" ? 90 : 70,
    },
    tabBarActiveTintColor: theme.colors.textOnBrand,
    tabBarInactiveTintColor: theme.colors.textOnBrandMuted,
    tabBarLabelStyle: {
      fontSize: 12,
    },
  },
  screens: {
    Home: {
      screen: IndexStack,
      options: {
        tabBarLabel: "Inicio",
        tabBarIcon: ({ color }) => (
          <Foundation
            name="home"
            size={24}
            color={color}
            style={{ marginBottom: -5 }}
          />
        ),
      },
    },
    Requests: {
      screen: Requests,
      options: {
        tabBarLabel: "Solicitudes",
        tabBarIcon: ({ color }) => (
          <Foundation
            name="list-thumbnails"
            size={24}
            color={color}
            style={{ marginBottom: -5 }}
          />
        ),
      },
    },
    Notifications: {
      screen: Notifications,
      options: {
        tabBarLabel: "Notificaciones",
        tabBarIcon: ({ color }) => (
          <MaterialCommunityIcons
            name="bell"
            size={24}
            color={color}
            style={{ marginBottom: -5 }}
          />
        ),
      },
    },
    Profile: {
      screen: MyProfile,
      options: {
        tabBarLabel: "Perfil",
        tabBarIcon: ({ color }) => (
          <Foundation
            name="torso"
            size={24}
            color={color}
            style={{ marginBottom: -5 }}
          />
        ),
      },
    },
  },
});
