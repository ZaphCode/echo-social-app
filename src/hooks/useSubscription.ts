import { useEffect } from "react";
import { pb } from "../lib/pocketbase";
import { RecordSubscription, UnsubscribeFunc } from "pocketbase";
import { PBCollectionsMap } from "@/utils/collections";

export default function useSubscription<K extends keyof PBCollectionsMap>(
  collection: K,
  track: string,
  callback: (data: RecordSubscription<PBCollectionsMap[K]>) => Promise<void>
) {
  useEffect(() => {
    console.log("Subscribed to", collection);

    let unsubscribe: UnsubscribeFunc | undefined;

    pb.collection<PBCollectionsMap[K]>(collection)
      .subscribe(track, callback)
      .then((result) => {
        unsubscribe = result;
      })
      .catch((err) => console.error(err));

    return () => {
      if (unsubscribe) {
        unsubscribe();
        console.log("Unsubscribed from", collection);
      }
    };
  }, [collection, track]);
}
