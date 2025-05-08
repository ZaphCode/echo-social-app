import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Home from "../../screens/Home";

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
    },
  },
});
