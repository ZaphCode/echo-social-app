import { useEffect, useState } from "react";
import { pb } from "../lib/pocketbase";
import { ClientResponseError, RecordFullListOptions } from "pocketbase";

type FetchingState = {
  isLoading: boolean;
  isError: boolean;
  error: string | null;
};

export default function useList<T>(
  collection: string,
  options?: RecordFullListOptions
) {
  const [data, setData] = useState<T[]>([]);
  const [state, setState] = useState<FetchingState>({
    isLoading: true,
    isError: false,
    error: null,
  });

  const getData = async () => {
    setState({ isLoading: true, isError: false, error: null });
    try {
      const res = await pb.collection(collection).getFullList<T>(options);
      setData(res);
      setState({ isLoading: false, isError: false, error: null });
    } catch (error) {
      if (error instanceof ClientResponseError) {
        console.log("PB Error:", error);
        return setState({
          isLoading: false,
          isError: true,
          error: error.message,
        });
      }
      setState({ isLoading: false, isError: true, error: "Unknown error" });
    }
  };

  useEffect(() => {
    getData();
  }, []);

  return [data, state, getData] as const;
}
