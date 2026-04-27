import { Navigation } from "./src/navigation/Navigation";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as SplashScreen from "expo-splash-screen";

import { AuthProvider } from "./src/context/Auth";
import { useFonts } from "expo-font";
import { AlertProvider } from "@/context/Alert";
import { AlertModal } from "@/components/ui/AlertModal";
import useAppTheme from "@/hooks/useAppTheme";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function AppWrapped() {
  const [loaded, error] = useFonts({
    "Geist-Bold": require("./assets/fonts/Geist-Bold.ttf"),
    "Geist-Regular": require("./assets/fonts/Geist-Regular.ttf"),
  });

  if (!loaded && error) {
    console.log("Error loading fonts", error);
    return null;
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
  const { resolvedTheme, theme } = useAppTheme();

  return (
    <>
      <StatusBar style={resolvedTheme === "dark" ? "light" : "dark"} />
      <Navigation theme={theme.navigationTheme} onReady={SplashScreen.hide} />
      <AlertModal />
    </>
  );
}
