import { Navigation } from "./src/navigation/Navigation";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as SplashScreen from "expo-splash-screen";

import { AuthProvider } from "./src/context/Auth";
import { useFonts } from "expo-font";
import { AlertProvider } from "@/context/Alert";
import { AlertModal } from "@/components/ui/AlertModal";
import useColorScheme from "@/hooks/useColorScheme";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function AppWrapped() {
  const [loaded, error] = useFonts({
    "Geist-Bold": require("./assets/fonts/Geist-Bold.ttf"),
    "Geist-Regular": require("./assets/fonts/Geist-Regular.ttf"),
  });

  if (!loaded && error) {
    return console.log("Error loading fonts", error);
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AlertProvider>
          <App />
        </AlertProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

function App() {
  const { activeMode } = useColorScheme();

  return (
    <>
      <StatusBar style={activeMode === "dark" ? "light" : "dark"} />
      <Navigation onReady={SplashScreen.hide} />
      <AlertModal />
    </>
  );
}
