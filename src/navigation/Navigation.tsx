import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  createStaticNavigation,
  StaticParamList,
} from "@react-navigation/native";
import { useAuthCtx } from "@/context/Auth";
import { AuthStack } from "./stacks/Auth";
import { MainStack } from "./stacks/Main";

const RootStack = createNativeStackNavigator({
  screenOptions: {
    headerShown: false,
  },
  initialRouteName: "Auth",
  screens: {
    Main: {
      screen: MainStack,
      if: () => useAuthCtx().authenticated,
    },
    Auth: {
      screen: AuthStack,
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
