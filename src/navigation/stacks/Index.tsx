import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Home from "@/screens/Home";
import SearchService from "@/screens/SearchService";
import ServiceOverview from "@/screens/ServiceOverview";
import { theme } from "@/theme/theme";

export const IndexStack = createNativeStackNavigator({
  initialRouteName: "Inicio",
  screenOptions: {
    headerShown: false,
  },
  screens: {
    Inicio: {
      screen: Home,
    },
    SearchService: {
      screen: SearchService,
      options: {
        headerShown: true,
        title: "",
        headerTintColor: theme.colors.textOnBrand,
        headerStyle: {
          backgroundColor: theme.colors.brandSurface,
        },
      },
    },
    ServiceOverview: {
      screen: ServiceOverview,
      options: {
        headerShown: true,
        title: "",
        headerTintColor: theme.colors.textOnBrand,
        headerStyle: {
          backgroundColor: theme.colors.brandSurface,
        },
      },
    },
  },
});
