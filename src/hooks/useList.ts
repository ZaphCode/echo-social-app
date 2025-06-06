import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { ClientResponseError, RecordFullListOptions } from "pocketbase";

import { pb } from "../lib/pocketbase";
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
    status: "loading",
    error: null,
  });

  const getData = async (opts?: RecordFullListOptions) => {
    setQueryState({ status: "loading", error: null });
    try {
      const res = await client
        .collection(collection)
        .getFullList<PBCollectionsMap[K]>(opts ? opts : options);

      if (opts) console.log("Refetching with options:", opts);

      setData(res);
      setQueryState({ status: "success", error: null });
    } catch (error) {
      const message =
        error instanceof ClientResponseError ? error.message : "Unknown error";
      console.log("PB Error:", error);
      setQueryState({ status: "error", error: message });
    }
  };

  useFocusEffect(
    useCallback(() => {
      console.log(`fetching ${collection} on focus`);
      getData();
    }, [])
  );

  return [data, queryState, getData] as const;
}
