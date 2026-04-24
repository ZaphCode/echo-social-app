import useProfile from "./useProfile";
import useMutate from "./useMutate";
import { User } from "@/models/User";
import { ProviderProfile } from "@/models/ProviderProfile";
import { supabase } from "@/lib/supabase";

export default function useJobsDone(provider: User) {
  const [profile, { status }] = useProfile(provider);

  async function addJob() {
    if (!profile || status !== "success") return;

    // Use RPC or direct update with increment
    const { data: result, error } = await supabase
      .from("provider_profile")
      .update({ jobs_done: (profile as ProviderProfile).jobs_done + 1 })
      .eq("id", profile.id)
      .select()
      .single();

    if (error || !result) return console.error("Failed to update jobs done count");

    console.log(
      `Jobs updated successfully: ${
        (profile as ProviderProfile).jobs_done
      } -> ${result.jobs_done}`
    );
  }

  return { addJob };
}
