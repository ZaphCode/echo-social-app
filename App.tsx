import { Navigation } from "./src/navigation/Navigation";
import { useEffect, useState } from "react";

import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { AuthProvider } from "./src/context/Auth";
import { useFonts } from "expo-font";
import { AlertProvider } from "@/context/Alert";
import { AlertModal } from "@/components/ui/AlertModal";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

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
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AlertProvider>
          <StatusBar style="light" />
          <Navigation onReady={() => SetAppIsReady(true)} />
          <AlertModal />
        </AlertProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
