import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { ClientProfile } from "@/models/ClientProfile";
import { ProviderProfile } from "@/models/ProviderProfile";
import { User } from "@/models/User";

type Profile = ClientProfile | ProviderProfile | null;

type QueryStatus = "idle" | "loading" | "success" | "error";

type QueryState = { status: QueryStatus; error: string | null };

type ProfileOptions = {
  select?: string;
};

export default function useProfile(
  user: User,
  options?: ProfileOptions
) {
  const [profile, setProfile] = useState<Profile>(null);
  const [queryState, setQueryState] = useState<QueryState>({
    status: "idle",
    error: null,
  });

  const getProfile = useCallback(async () => {
    if (!user) return;
    setQueryState({ status: "loading", error: null });
    try {
      const collection =
        user.role === "client" ? "client_profile" : "provider_profile";

      const { data, error } = await supabase
        .from(collection)
        .select(options?.select || "*")
        .eq("user", user.id)
        .single();

      if (error) throw error;

      setProfile(data as Profile);
      setQueryState({ status: "success", error: null });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error";
      setQueryState({ status: "error", error: message });
      setProfile(null);
    }
  }, [user, options]);

  useEffect(() => {
    getProfile();
  }, []);

  return [profile, queryState, getProfile] as const;
}
