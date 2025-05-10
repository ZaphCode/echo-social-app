import { useEffect, useState } from "react";
import { pb } from "../lib/pocketbase";
import { ClientResponseError, RecordFullListOptions } from "pocketbase";
import { PBCollectionsMap } from "@/utils/collections";

type FetchingState = {
  isLoading: boolean;
  isError: boolean;
  error: string | null;
};

export default function useList<K extends keyof PBCollectionsMap>(
  collection: K,
  options?: RecordFullListOptions
) {
  const [data, setData] = useState<PBCollectionsMap[K][]>([]);
  const [fetchingData, setFetchingData] = useState<FetchingState>({
    isLoading: true,
    isError: false,
    error: null,
  });

  const getData = async () => {
    setFetchingData({ isLoading: true, isError: false, error: null });
    try {
      const res = await pb
        .collection(collection)
        .getFullList<PBCollectionsMap[K]>(options);
      setData(res);
      setFetchingData({ isLoading: false, isError: false, error: null });
    } catch (error) {
      if (error instanceof ClientResponseError) {
        console.log("PB Error:", error);
        return setFetchingData({
          isLoading: false,
          isError: true,
          error: error.message,
        });
      }
      setFetchingData({
        isLoading: false,
        isError: true,
        error: "Unknown error",
      });
    }
  };

  useEffect(() => {
    getData();
  }, []);

  return [data, fetchingData] as const;
}
