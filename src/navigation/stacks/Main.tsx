import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Tabs } from "./Tabs";
import Chatroom from "@/screens/Chatroom";
import { theme } from "@/theme/theme";
import ServiceEditor from "@/screens/ServiceEditor";

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
    ServiceEditor: {
      screen: ServiceEditor,
      options: {
        headerShown: true,
        title: "Editor de Servicio",
        headerTitleStyle: {
          color: "white",
          fontSize: theme.fontSizes.lg,
          fontFamily: theme.fontFamily.bold,
        },
        headerStyle: {
          backgroundColor: theme.colors.darkerGray,
        },
      },
    },
  },
});
