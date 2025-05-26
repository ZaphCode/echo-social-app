import { useState, useEffect } from "react";
import { User } from "@/models/User";
import { pb } from "@/lib/pocketbase";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial auth state
    const currentUser = pb.authStore.model as User | null;
    console.log("Current auth state:", {
      isAuthenticated: pb.authStore.isValid,
      user: currentUser,
      token: pb.authStore.token
    });
    
    setUser(currentUser);
    setLoading(false);

    // Listen for auth state changes
    const unsubscribe = pb.authStore.onChange((token, model) => {
      console.log("Auth state changed:", {
        token,
        model,
        isAuthenticated: pb.authStore.isValid
      });
      setUser(model as User | null);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return { user, loading };
} 