import { Theme } from "@react-navigation/native";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";

import { fonts } from "@/theme/theme";

/** Native header that blends into the page: no bar, no shadow, minimal back. */
export function stackHeader(
  { theme }: { theme: Theme },
  title = "",
): NativeStackNavigationOptions {
  return {
    headerShown: true,
    title,
    headerShadowVisible: false,
    headerStyle: { backgroundColor: theme.colors.background },
    headerTintColor: theme.colors.text,
    headerTitleStyle: { fontFamily: fonts.bold, fontSize: 17 },
    headerBackButtonDisplayMode: "minimal",
  };
}
