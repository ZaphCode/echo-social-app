import { useEffect, useState, useCallback } from "react";
import { pb as client } from "@/lib/pocketbase";
import { ClientResponseError, RecordFullListOptions } from "pocketbase";
import { ClientProfile } from "@/models/ClientProfile";
import { ProviderProfile } from "@/models/ProviderProfile";
import { User } from "@/models/User";

type Profile = ClientProfile | ProviderProfile | null;

type QueryStatus = "idle" | "loading" | "success" | "error";

type QueryState = { status: QueryStatus; error: string | null };

export default function useProfile(
  user: User,
  options?: RecordFullListOptions
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
      const res = await client
        .collection(collection)
        .getFirstListItem<Profile>(`user="${user.id}"`, options);
      setProfile(res);
      setQueryState({ status: "success", error: null });
    } catch (error) {
      const message =
        error instanceof ClientResponseError ? error.message : "Unknown error";
      setQueryState({ status: "error", error: message });
      setProfile(null);
    }
  }, [user, options]);

  useEffect(() => {
    getProfile();
  }, []);

  return [profile, queryState, getProfile] as const;
}
