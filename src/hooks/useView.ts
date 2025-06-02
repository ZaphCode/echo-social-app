import { useEffect, useState } from "react";
import { pb as client } from "../lib/pocketbase";
import { ClientResponseError, RecordFullListOptions } from "pocketbase";
import { PBCollectionsMap } from "@/utils/collections";

type QueryStatus = "idle" | "loading" | "success" | "error";

type QueryState = {
  status: QueryStatus;
  error: string | null;
};

export default function useView<K extends keyof PBCollectionsMap>(
  collection: K,
  id: string,
  options?: RecordFullListOptions
) {
  const [data, setData] = useState<PBCollectionsMap[K] | null>(null);
  const [queryState, setQueryState] = useState<QueryState>({
    status: "idle",
    error: null,
  });

  const getData = async () => {
    setQueryState({ status: "loading", error: null });
    try {
      const res = await client
        .collection(collection)
        .getOne<PBCollectionsMap[K]>(id, options);
      setData(res);
      setQueryState({ status: "success", error: null });
    } catch (error) {
      const message =
        error instanceof ClientResponseError ? error.message : "Unknown error";
      console.log("PB Error:", error);
      setQueryState({ status: "error", error: message });
    }
  };

  useEffect(() => {
    getData();
  }, []);

  return [data, queryState, getData] as const;
}
