import { useState } from "react";
import { pb } from "../lib/pocketbase";
import { RecordOptions } from "pocketbase";
import { PBCollectionsMap } from "@/utils/collections";
import { logPBError } from "@/utils/testing";

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

  const create = async (data: Partial<PBCollectionsMap[K]> | FormData) => {
    setMutationState({ status: "loading", error: null });

    try {
      const res = await pb
        .collection(collection)
        .create<PBCollectionsMap[K]>(data, options || {});
      setMutationState({ status: "success", error: null });
      return res;
    } catch (error) {
      console.log("PB Create Error:", error);
      logPBError(error);
      setMutationState({ status: "error", error: "Error al crear" });
      return null;
    }
  };

  const update = async (
    id: string,
    data: Partial<PBCollectionsMap[K]> | FormData
  ) => {
    setMutationState({ status: "loading", error: null });

    try {
      const res = await pb
        .collection(collection)
        .update<PBCollectionsMap[K]>(id, data, options || {});
      setMutationState({ status: "success", error: null });
      return res;
    } catch (error) {
      console.log("PB Update Error:", error);
      logPBError(error);
      setMutationState({ status: "error", error: "Error al actualizar" });
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
      console.log("PB Delete Error:", error);
      logPBError(error);
      setMutationState({ status: "error", error: "Error al eliminar" });
      return null;
    }
  };

  return { create, update, remove, mutationState };
}
