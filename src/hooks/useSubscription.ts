import { useEffect, useState } from "react";
import { pb } from "../lib/pocketbase";
import { RecordSubscription } from "pocketbase";
import { PBCollectionsMap } from "@/utils/collections";

export default function useSubscription<K extends keyof PBCollectionsMap>(
  collection: K,
  track: string,
  callback: (data: RecordSubscription<PBCollectionsMap[K]>) => void
) {
  useEffect(() => {
    console.log("Subscribed to ", collection);

    pb.collection<PBCollectionsMap[K]>(collection)
      .subscribe(track, callback)
      .catch((err) => console.error(err));

    return () => {
      console.log("Unsubscribed");
      pb.collection(collection)
        .unsubscribe()
        .catch((err) => console.error(err));
    };
  }, []);
}
