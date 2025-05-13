import { Navigation } from "./src/navigation/Navigation";
import { useEffect, useState } from "react";

import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { AuthProvider } from "./src/context/Auth";
import { useFonts } from "expo-font";

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, SetAppIsReady] = useState(false);

  const [loaded, error] = useFonts({
    "Geist-Bold": require("./assets/fonts/Geist-Bold.ttf"),
    "Geist-Regular": require("./assets/fonts/Geist-Regular.ttf"),
  });

  useEffect(() => {
    if (appIsReady && loaded) SplashScreen.hideAsync();
  }, [appIsReady, loaded, error]);

  if (!loaded && error) {
    return console.log("Error loading fonts", error);
  }

  return (
    <AuthProvider>
      <StatusBar style="light" />
      <Navigation onReady={() => SetAppIsReady(true)} />
    </AuthProvider>
  );
}
