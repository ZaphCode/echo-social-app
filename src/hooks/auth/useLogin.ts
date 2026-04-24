import { useAuthCtx } from "@/context/Auth";
import { supabase } from "@/lib/supabase";
import { logError } from "@/utils/testing";
import { useState } from "react";

export default function useLogin() {
  const [loading, setLoading] = useState(false);
  const auth = useAuthCtx();

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        logError(error);
        if (error.message.includes("Invalid login credentials"))
          return "invalid-credentials";
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

      auth.login({
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
      });
    } catch (error) {
      logError(error);
      return "server-error";
    } finally {
      setLoading(false);
    }
  };

  return {
    login,
    loading,
  };
}
