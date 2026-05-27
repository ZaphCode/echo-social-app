import { useAuthCtx } from "@/context/Auth";
import { supabase } from "@/lib/supabase";
import { getProfileByUser } from "@/api/profiles";
import { saveOfflineCredential } from "@/offline/auth";
import { getOfflineNetworkState, isLikelyNetworkError } from "@/offline/network";
import { logError } from "@/utils/testing";
import { useState } from "react";

export type LoginError =
  | "invalid-credentials"
  | "offline-login-unavailable"
  | "server-error";

export default function useLogin() {
  const [loading, setLoading] = useState(false);
  const auth = useAuthCtx();

  const tryOfflineLogin = async (email: string, password: string) => {
    try {
      return await auth.offlineLogin(email, password);
    } catch (error) {
      logError(error);
      return false;
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      if (!getOfflineNetworkState()) {
        const didLoginOffline = await tryOfflineLogin(email, password);
        return didLoginOffline ? undefined : "offline-login-unavailable";
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        logError(error);
        if (error.message.includes("Invalid login credentials"))
          return "invalid-credentials";
        if (isLikelyNetworkError(error)) {
          const didLoginOffline = await tryOfflineLogin(email, password);
          return didLoginOffline ? undefined : "offline-login-unavailable";
        }
        return "server-error";
      }

      if (!data.user) return "Usuario no encontrado";

      // Fetch profile from profiles table
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();

      if (profileError || !profile) return "server-error";

      const user = {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role,
        avatar: profile.avatar || "",
        email_visibility: profile.email_visibility,
        verified: profile.verified,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
        location: profile.location || undefined,
      };

      try {
        await getProfileByUser(user);
      } catch (error) {
        console.log("Profile details cache failed:", error);
      }

      await saveOfflineCredential(email, password, user);
      auth.login(user, "online");
    } catch (error) {
      logError(error);
      const didLoginOffline = await tryOfflineLogin(email, password);
      if (didLoginOffline) return undefined;
      return isLikelyNetworkError(error) || !getOfflineNetworkState()
        ? "offline-login-unavailable"
        : "server-error";
    } finally {
      setLoading(false);
    }
  };

  return {
    login,
    loading,
  };
}
