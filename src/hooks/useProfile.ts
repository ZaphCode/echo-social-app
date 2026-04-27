import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { getProfileByUser, profilesKeys } from "@/api/profiles";
import { ProfileDetails } from "@/api/types";
import { User } from "@/models/User";

type QueryStatus = "idle" | "loading" | "success" | "error";

type QueryState = { status: QueryStatus; error: string | null };

export default function useProfile(
  user: User
) {
  const query = useQuery<ProfileDetails>({
    queryKey: profilesKeys.detail(user.role, user.id),
    queryFn: () => getProfileByUser(user),
    enabled: !!user?.id,
  });

  const queryState: QueryState = {
    status: query.isPending ? "loading" : query.isError ? "error" : "success",
    error: query.error instanceof Error ? query.error.message : null,
  };

  const getProfile = useCallback(async () => {
    await query.refetch();
  }, [query]);

  return [query.data ?? null, queryState, getProfile] as const;
}
