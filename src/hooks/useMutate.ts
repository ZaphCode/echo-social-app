import { useState } from "react";
import { supabase } from "../lib/supabase";
import { TablesMap } from "@/utils/collections";
import { logError } from "@/utils/testing";

type MutationStatus = "idle" | "loading" | "success" | "error";

type MutationState = {
  status: MutationStatus;
  error: string | null;
};

type MutateOptions = {
  select?: string;
};

export default function useMutate<K extends keyof TablesMap>(
  collection: K,
  options?: MutateOptions
) {
  const [mutationState, setMutationState] = useState<MutationState>({
    status: "idle",
    error: null,
  });

  const selectClause = options?.select || "*";

  const create = async (data: Partial<TablesMap[K]>) => {
    setMutationState({ status: "loading", error: null });

    try {
      const { data: result, error } = await supabase
        .from(collection)
        .insert(data as Record<string, unknown>)
        .select(selectClause)
        .single();

      if (error) throw error;

      setMutationState({ status: "success", error: null });
      return result as TablesMap[K];
    } catch (error) {
      console.log("Supabase Create Error:", error);
      logError(error);
      setMutationState({ status: "error", error: "Error al crear" });
      return null;
    }
  };

  const update = async (
    id: string,
    data: Partial<TablesMap[K]>
  ) => {
    setMutationState({ status: "loading", error: null });

    try {
      const { data: result, error } = await supabase
        .from(collection)
        .update(data as Record<string, unknown>)
        .eq("id", id)
        .select(selectClause)
        .single();

      if (error) throw error;

      setMutationState({ status: "success", error: null });
      return result as TablesMap[K];
    } catch (error) {
      console.log("Supabase Update Error:", error);
      logError(error);
      setMutationState({ status: "error", error: "Error al actualizar" });
      return null;
    }
  };

  const remove = async (id: string) => {
    setMutationState({ status: "loading", error: null });

    try {
      const { error } = await supabase
        .from(collection)
        .delete()
        .eq("id", id);

      if (error) throw error;

      setMutationState({ status: "success", error: null });
      return true;
    } catch (error) {
      console.log("Supabase Delete Error:", error);
      logError(error);
      setMutationState({ status: "error", error: "Error al eliminar" });
      return null;
    }
  };

  return { create, update, remove, mutationState };
}
