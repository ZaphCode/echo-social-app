import { useEffect } from "react";
import { supabase } from "../lib/supabase";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

type SubscriptionCallback<T> = (payload: {
  action: "INSERT" | "UPDATE" | "DELETE";
  record: T;
  old_record?: T;
}) => Promise<void>;

export default function useSubscription<T>(
  collection: string,
  track: string,
  callback: SubscriptionCallback<T>,
) {
  useEffect(() => {
    const channel = supabase
      .channel(`${collection}_${track}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: collection,
        },
        (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
          const action =
            payload.eventType === "INSERT"
              ? "INSERT"
              : payload.eventType === "UPDATE"
                ? "UPDATE"
                : "DELETE";

          callback({
            action,
            record: (payload.new || {}) as T,
            old_record: (payload.old || undefined) as T | undefined,
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [collection, track]);
}
