import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Chatroom from "@/screens/Chatroom";
import ContractingEditor from "@/screens/ContractingEditor";
import ContractingOverview from "@/screens/ContractingOverview";
import Notifications from "@/screens/Notifications";
import Privacy from "@/screens/Privacy";
import SearchService from "@/screens/SearchService";
import ServiceEditor from "@/screens/ServiceEditor";
import ServiceOverview from "@/screens/ServiceOverview";
import SqlViewer from "@/screens/SqlViewer";
import UserProfile from "@/screens/UserProfile";
import { fonts } from "@/theme/theme";
import { stackHeader } from "../headerOptions";
import { Tabs } from "./Tabs";

export const MainStack = createNativeStackNavigator({
  initialRouteName: "Tabs",
  screenOptions: {
    headerShown: false,
  },
  screens: {
    Tabs: Tabs,
    // Detail screens draw their own floating back button over the photo.
    ServiceOverview: ServiceOverview,
    ContractingOverview: ContractingOverview,
    Chatroom: Chatroom,
    SearchService: {
      screen: SearchService,
      options: (props) => stackHeader(props, "Buscar"),
    },
    Notifications: {
      screen: Notifications,
      options: (props) => stackHeader(props, "Notificaciones"),
    },
    ServiceEditor: {
      screen: ServiceEditor,
      options: (props) => ({
        ...stackHeader(props),
        presentation: "modal",
        headerShown: false,
      }),
    },
    ContractingEditor: {
      screen: ContractingEditor,
      options: (props) => ({
        ...stackHeader(props),
        presentation: "modal",
        headerShown: false,
      }),
    },
    UserProfile: {
      screen: UserProfile,
      options: (props) => stackHeader(props),
    },
    Privacy: {
      screen: Privacy,
      options: (props) => stackHeader(props, "Privacidad"),
    },
    // Debug tool: intentionally keeps its own look.
    SqlViewer: {
      screen: SqlViewer,
      options: {
        headerShown: true,
        title: "SQL Viewer",
        headerTintColor: "#E2E8F0",
        headerTitleStyle: {
          color: "#F8FAFC",
          fontSize: 18,
          fontFamily: fonts.bold,
        },
        headerStyle: {
          backgroundColor: "#000000",
        },
      },
    },
  },
});
