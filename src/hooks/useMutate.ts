import { useState } from "react";
import { pb } from "../lib/pocketbase";
import { ClientResponseError, RecordOptions } from "pocketbase";
import { PBCollectionsMap } from "@/utils/collections";

type MutationStatus = "idle" | "loading" | "success" | "error";

type MutationState = {
  status: MutationStatus;
  error: string | null;
};

export default function useMutate<K extends keyof PBCollectionsMap>(
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

  const update = async (id: string, data: Partial<PBCollectionsMap[K]>) => {
    setMutationState({ status: "loading", error: null });

    try {
      const res = await pb
        .collection(collection)
        .update<PBCollectionsMap[K]>(id, data, options || {});
      setMutationState({ status: "success", error: null });
      return res;
    } catch (error) {
      const message =
        error instanceof ClientResponseError ? error.message : "Unknown error";
      console.log("PB Update Error:", error);
      setMutationState({ status: "error", error: message });
      return null;
    }
  };

  const remove = async (id: string) => {
    setMutationState({ status: "loading", error: null });

    try {
      const res = await pb.collection(collection).delete(id, options || {});
      setMutationState({ status: "success", error: null });
      return res;
    } catch (error) {
      const message =
        error instanceof ClientResponseError ? error.message : "Unknown error";
      console.log("PB Remove Error:", error);
      setMutationState({ status: "error", error: message });
      return null;
    }
  };

  return { create, update, remove, mutationState };
}
