import { useState } from "react";
import { pb } from "../lib/pocketbase";
import { ClientResponseError, RecordOptions } from "pocketbase";
import { PBCollectionsMap } from "@/utils/collections";

type MutationStatus = "idle" | "loading" | "success" | "error";

type MutationState = {
  status: MutationStatus;
  error: string | null;
};

export default function useCreate<K extends keyof PBCollectionsMap>(
  collection: K,
  options?: RecordOptions
) {
  const [mutationState, setMutationState] = useState<MutationState>({
    status: "idle",
    error: null,
  });

  const create = async (data: Partial<PBCollectionsMap[K]>) => {
    setMutationState({ status: "loading", error: null });

    try {
      const res = await pb
        .collection(collection)
        .create<PBCollectionsMap[K]>(data, options || {});
      setMutationState({ status: "success", error: null });
      return res;
    } catch (error) {
      const message =
        error instanceof ClientResponseError ? error.message : "Unknown error";
      console.log("PB Create Error:", error);
      setMutationState({ status: "error", error: message });
      return null;
    }
  };

  return { create, mutationState };
}
