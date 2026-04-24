import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigation } from "@react-navigation/native";

/**
 * Health check hook - verifies Supabase connection is alive.
 * With Supabase cloud this is rarely needed, but kept for parity.
 */
export default function useHealthCheck() {
  const navigation = useNavigation();

  useEffect(() => {
    supabase
      .from("service_category")
      .select("id")
      .limit(1)
      .then(({ error }) => {
        if (error) {
          console.warn("Supabase health check failed:", error.message);
          // Optionally navigate to an error screen
          // navigation.navigate("ChangeApi");
        }
      });
  }, []);
}
