// import { useCallback, useEffect, useState } from "react";
// import { useFocusEffect } from "@react-navigation/native";
// import { ClientResponseError, RecordFullListOptions } from "pocketbase";

// import { pb } from "../lib/pocketbase";
// import { PBCollectionsMap } from "@/utils/collections";

// type QueryStatus = "idle" | "loading" | "success" | "error";

// type QueryState = {
//   status: QueryStatus;
//   error: string | null;
// };

// export default function useList<K extends keyof PBCollectionsMap>(
//   collection: K,
//   options?: RecordFullListOptions & { notRefreshOnFocus?: boolean }
// ) {
//   const [data, setData] = useState<PBCollectionsMap[K][]>([]);
//   const [queryState, setQueryState] = useState<QueryState>({
//     status: "loading",
//     error: null,
//   });

//   const getData = async (opts?: RecordFullListOptions) => {
//     setQueryState({ status: "loading", error: null });
//     try {
//       const res = await pb
//         .collection(collection)
//         .getFullList<PBCollectionsMap[K]>(opts ? opts : options);

//       if (opts) console.log("Refetching with options:", opts);

//       setData(res);
//       setQueryState({ status: "success", error: null });
//     } catch (error) {
//       const message =
//         error instanceof ClientResponseError ? error.message : "Unknown error";
//       console.log("PB Error:", error);
//       setQueryState({ status: "error", error: message });
//     }
//   };

//   if (options?.notRefreshOnFocus) {
//     useEffect(() => {
//       console.log(`fetching ${collection} once`);
//       getData();
//     }, []);
//   } else {
//     useFocusEffect(
//       useCallback(() => {
//         console.log(`fetching ${collection} on focus`);
//         getData();
//       }, [collection])
//     );
//   }

//   return [data, queryState, getData] as const;
// }

import { useQuery } from "@tanstack/react-query";
import { pb } from "../lib/pocketbase";
import { PBCollectionsMap } from "@/utils/collections";
import { ClientResponseError, RecordFullListOptions } from "pocketbase";
import { useMemo, useState } from "react";

export default function useList<K extends keyof PBCollectionsMap>(
  collection: K,
  initialOptions?: RecordFullListOptions & {
    notRefreshOnFocus?: boolean;
    cacheTime?: number;
  }
) {
  const [opts, setOpts] = useState(initialOptions);

  const fetchPB = async () => {
    try {
      const res = await pb
        .collection(collection)
        .getFullList<PBCollectionsMap[K]>(opts);
      return res;
    } catch (error) {
      const message =
        error instanceof ClientResponseError ? error.message : "Unknown error";
      throw new Error(message);
    }
  };

  const { data, status, error } = useQuery({
    queryKey: [collection, opts], // <- si opts cambia, se re-ejecuta fetchPB
    queryFn: fetchPB,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: !opts?.notRefreshOnFocus,
    refetchOnReconnect: true,
    retry: 2,
    gcTime: opts?.cacheTime ?? 1000 * 60 * 3,
  });

  const queryStatus = useMemo(
    () => (status === "pending" ? "loading" : status),
    [status]
  );

  // Para actualizar las opciones del query (y refrescar automáticamente)
  const updateOptions = (newOptions?: RecordFullListOptions) => {
    setOpts((prev) => ({ ...prev, ...newOptions }));
  };

  return [data ?? [], { status: queryStatus, error }, updateOptions] as const;
}
