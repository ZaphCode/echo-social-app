import useProfile from "./useProfile";
import { User } from "@/models/User";
import { ProviderProfileWithCategory } from "@/api/types";
import { incrementProviderJobsDone } from "@/api/profiles";

export default function useJobsDone(provider: User) {
  const [profile, { status }] = useProfile(provider);

  async function addJob() {
    if (provider.role !== "provider") return;
    if (!profile || status !== "success") return;
    if (!("jobs_done" in profile)) return;

    const providerProfile = profile as ProviderProfileWithCategory;
    const result = await incrementProviderJobsDone(
      providerProfile.id,
      providerProfile.jobs_done
    ).catch(() => null);

    if (!result) return console.error("Failed to update jobs done count");

    console.log(
      `Jobs updated successfully: ${providerProfile.jobs_done} -> ${result.jobs_done}`
    );
  }

  return { addJob };
}
