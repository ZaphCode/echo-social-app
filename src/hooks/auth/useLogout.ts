import { useAuthCtx } from "@/context/Auth";
import { SUPABASE_AUTH_STORAGE_KEY, supabase } from "@/lib/supabase";
import { getOfflineNetworkState } from "@/offline/network";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQueryClient } from "@tanstack/react-query";

export default function useLogout() {
  const auth = useAuthCtx();
  const queryClient = useQueryClient();

  const logout = async () => {
    if (!getOfflineNetworkState()) {
      await AsyncStorage.removeItem(SUPABASE_AUTH_STORAGE_KEY);
      queryClient.clear();
      auth.logout();
      return;
    }

    if (getOfflineNetworkState()) {
      try {
        await supabase.auth.signOut();
      } catch (error) {
        console.log("Supabase signOut failed, clearing local session:", error);
      }
    }

    await AsyncStorage.removeItem(SUPABASE_AUTH_STORAGE_KEY);
    queryClient.clear();
    auth.logout();
  };

  return logout;
}
