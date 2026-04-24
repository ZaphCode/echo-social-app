import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { TablesMap } from "@/utils/collections";

type QueryStatus = "idle" | "loading" | "success" | "error";

type QueryState = {
  status: QueryStatus;
  error: string | null;
};

type ViewOptions = {
  select?: string;
};

export default function useView<K extends keyof TablesMap>(
  collection: K,
  id: string,
  options?: ViewOptions
) {
  const [data, setData] = useState<TablesMap[K] | null>(null);
  const [queryState, setQueryState] = useState<QueryState>({
    status: "idle",
    error: null,
  });

  const getData = async () => {
    setQueryState({ status: "loading", error: null });
    try {
      const { data: result, error } = await supabase
        .from(collection)
        .select(options?.select || "*")
        .eq("id", id)
        .single();

      if (error) throw error;

      setData(result as TablesMap[K]);
      setQueryState({ status: "success", error: null });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error";
      console.log("Supabase Error:", error);
      setQueryState({ status: "error", error: message });
    }
  };

  useEffect(() => {
    getData();
  }, []);

  return [data, queryState, getData] as const;
}
