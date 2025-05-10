import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SignIn from "../../screens/SignIn";

export const AuthStack = createNativeStackNavigator({
  initialRouteName: "SignIn",
  screenOptions: {
    headerShown: false,
  },
  screens: {
    SignIn: SignIn,
  },
});
