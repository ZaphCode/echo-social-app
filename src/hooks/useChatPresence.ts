import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";

type ChatPresencePayload = {
  user_id?: string;
};

export default function useChatPresence(requestId: string, userId: string) {
  const [presentUserIds, setPresentUserIds] = useState<string[]>([]);

  useEffect(() => {
    const channel = supabase.channel(`chat_presence_${requestId}`);

    const syncPresence = () => {
      const state = channel.presenceState<ChatPresencePayload>();
      const userIds = Object.values(state)
        .flat()
        .map((presence) => presence.user_id)
        .filter((id): id is string => !!id);

      setPresentUserIds([...new Set(userIds)]);
    };

    channel
      .on("presence", { event: "sync" }, syncPresence)
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ user_id: userId });
          syncPresence();
        }
      });

    return () => {
      channel.untrack();
      supabase.removeChannel(channel);
    };
  }, [requestId, userId]);

  return presentUserIds;
}
