import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  createStaticNavigation,
  StaticParamList,
} from "@react-navigation/native";
import { useAuthCtx } from "@/context/Auth";
import { AuthStack } from "./stacks/Auth";
import { MainStack } from "./stacks/Main";
import ChangeApi from "@/screens/ChangeApi";
import usePBCheck from "@/hooks/usePBCheck";
import { theme } from "@/theme/theme";

const RootStack = createNativeStackNavigator({
  screenOptions: {
    headerShown: false,
  },
  initialRouteName: "Auth",
  screens: {
    Main: {
      screen: MainStack,
      if() {
        // usePBCheck();
        return useAuthCtx().authenticated;
      },
    },
    Auth: {
      screen: AuthStack,
      if() {
        // usePBCheck();
        return true;
      },
    },
    ChangeApi: {
      screen: ChangeApi,
      options: {
        headerShown: true,
        headerTintColor: "white",
        headerBackVisible: false,
        title: "Configuración de API",
        headerStyle: {
          backgroundColor: theme.colors.secondaryBlue,
        },
      },
    },
  },
});

export const Navigation = createStaticNavigation(RootStack);

type RootStackParamList = StaticParamList<typeof RootStack>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
