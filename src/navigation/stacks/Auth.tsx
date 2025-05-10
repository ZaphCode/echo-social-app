import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SignIn from "@/screens/SignIn";
import SignUp from "@/screens/SignUp";
import Profile from "@/screens/Profile";

export const AuthStack = createNativeStackNavigator({
  initialRouteName: "Profile",
  screenOptions: {
    headerShown: false,
  },
  screens: {
    SignIn: SignIn,
    SignUp: SignUp,
    Profile: Profile,
  },
});
