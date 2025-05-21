import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Tabs } from "./Tabs";
import Chatroom from "@/screens/Chatroom";
import { theme } from "@/theme/theme";

export const MainStack = createNativeStackNavigator({
  screenOptions: {
    headerShown: false,
  },
  initialRouteName: "Tabs",
  screens: {
    Tabs: {
      screen: Tabs,
    },
    Chatroom: {
      screen: Chatroom,
    },
  },
});
