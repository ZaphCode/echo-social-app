import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SignIn from "@/screens/SignIn";
import SignUp from "@/screens/SignUp";
import ProfileCreation from "@/screens/ProfileCreation";

export const AuthStack = createNativeStackNavigator({
  initialRouteName: "SignIn",
  screenOptions: {
    headerShown: false,
  },
  screens: {
    SignIn: SignIn,
    SignUp: SignUp,
    ProfileCreation: {
      screen: ProfileCreation,
    },
  },
});
