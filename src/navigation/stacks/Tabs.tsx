import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Home from "../../screens/Home";
import { Foundation } from "@expo/vector-icons";
import Profile from "@/screens/Profile";
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
      screen: Home,
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
