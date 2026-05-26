import { User } from "@/models/User";
import { finalizeRequestCompletion } from "@/api/serviceRequests";

export default function useJobsDone(provider: User) {
  async function addJob(requestId?: string) {
    if (provider.role !== "provider") return;
    if (!requestId) return;

    const result = await finalizeRequestCompletion(requestId).catch(() => null);

    if (!result) return console.error("Failed to update jobs done count");
  }

  return { addJob };
}
