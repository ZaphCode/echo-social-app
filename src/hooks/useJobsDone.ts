import useProfile from "./useProfile";
import useMutate from "./useMutate";
import { User } from "@/models/User";
import { ProviderProfile } from "@/models/ProviderProfile";

export default function useJobsDone(provider: User) {
  const [profile, { status }] = useProfile(provider);

  const { update } = useMutate("provider_profile", {});

  async function addJob() {
    if (!profile || status !== "success") return;

    const result = await update(profile.id, {
      "jobs_done+": 1,
    } as any);

    if (!result) return console.error("Failed to update jobs done count");

    console.log(
      `Jobs updated successfully: ${
        (profile as ProviderProfile).jobs_done
      } -> ${result.jobs_done}`
    );
  }

  return { addJob };
}
