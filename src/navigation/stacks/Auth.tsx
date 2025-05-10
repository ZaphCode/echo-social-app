import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SignIn from "@/screens/SignIn";
import SignUp from "@/screens/SignUp";

export const AuthStack = createNativeStackNavigator({
  initialRouteName: "SignIn",
  screenOptions: {
    headerShown: false,
  },
  screens: {
    SignIn: SignIn,
    SignUp: SignUp,
  },
});
