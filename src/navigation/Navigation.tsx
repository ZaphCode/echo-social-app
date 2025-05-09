import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  createStaticNavigation,
  StaticParamList,
  useNavigation,
} from "@react-navigation/native";
import { Tabs } from "./stacks/Tabs";
import { AuthStack } from "./stacks/Auth";
import { pb } from "../lib/pocketbase";
import { useAuthCtx } from "@/context/Auth";

const RootStack = createNativeStackNavigator({
  screenOptions: {
    headerShown: false,
  },
  initialRouteName: "Auth",
  screens: {
    Main: {
      screen: Tabs,
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
