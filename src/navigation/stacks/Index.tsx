import Home from "@/screens/Home";
import SearchService from "@/screens/SearchService";
import ServiceOverview from "@/screens/ServiceOverview";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// const { colors } = useColorScheme();

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
        headerStyle: {
          // backgroundColor: colors.darkerGray,
        },
      },
    },
    ServiceOverview: {
      screen: ServiceOverview,
      options: {
        headerShown: true,
        title: "",
        headerStyle: {
          // backgroundColor: colors.darkerGray,
        },
      },
    },
  },
});
