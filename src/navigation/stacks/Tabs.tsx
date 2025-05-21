import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { IndexStack } from "./Index";
import { Foundation, MaterialCommunityIcons } from "@expo/vector-icons";
import Profile from "@/screens/Profile";
import Notifications from "@/screens/Notifications";
import Requests from "@/screens/Requests";

export const Tabs = createBottomTabNavigator({
  initialRouteName: "Home",
  screenOptions: {
    headerShown: false,
    tabBarStyle: {
      backgroundColor: "#1F1F1F",
      borderTopWidth: 0,
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
      screen: Profile,
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
