import { useEffect, useState } from "react";
import { pb } from "../lib/pocketbase";
import { ClientResponseError, RecordFullListOptions } from "pocketbase";
import { PBCollectionsMap } from "@/utils/collections";
import { PBClient } from "@/utils/testing";

type QueryStatus = "idle" | "loading" | "success" | "error";

type QueryState = {
  status: QueryStatus;
  error: string | null;
};

export default function useList<K extends keyof PBCollectionsMap>(
  collection: K,
  options?: RecordFullListOptions,
  client: typeof pb | PBClient = pb
) {
  const [data, setData] = useState<PBCollectionsMap[K][]>([]);
  const [queryState, setQueryState] = useState<QueryState>({
    status: "idle",
    error: null,
  });

  const getData = async () => {
    setQueryState({ status: "loading", error: null });
    try {
      const res = await client
        .collection(collection)
        .getFullList<PBCollectionsMap[K]>(options);
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
