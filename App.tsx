import { Suspense } from "react";
import { SQLiteProvider } from "expo-sqlite";

import { Navigation } from "./src/navigation/Navigation";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as SplashScreen from "expo-splash-screen";

import { AuthProvider } from "./src/context/Auth";
import { useFonts } from "expo-font";
import { AlertProvider } from "@/context/Alert";
import { OfflineProvider } from "@/context/Offline";
import { AlertModal } from "@/components/ui/AlertModal";
import useAppTheme from "@/hooks/useAppTheme";
import { initChatDatabase } from "@/chat/db";
import { ChatSyncProvider } from "@/chat/ChatSyncProvider";
import { KeyboardProvider } from "react-native-keyboard-controller";

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
      <KeyboardProvider>
        <Suspense fallback={null}>
          <SQLiteProvider
            databaseName="echo-chat.db"
            onInit={initChatDatabase}
            useSuspense
          >
            <AuthProvider>
              <OfflineProvider>
                <ChatSyncProvider>
                  <AlertProvider>
                    <App />
                  </AlertProvider>
                </ChatSyncProvider>
              </OfflineProvider>
            </AuthProvider>
          </SQLiteProvider>
        </Suspense>
      </KeyboardProvider>
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
