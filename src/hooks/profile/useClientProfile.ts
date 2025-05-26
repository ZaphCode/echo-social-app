import { useState, useEffect } from "react";
import { ClientProfile } from "@/models/ClientProfile";
import { ProviderProfile } from "@/models/ProviderProfile";
import { User } from "@/models/User";
import { pb } from "@/lib/pocketbase";
import { useAuth } from "@/hooks/auth/useAuth";

export type ProfileWithUser = (ClientProfile | ProviderProfile) & {
  expand: {
    user: User;
  };
};

export default function useClientProfile(refreshKey: number = 0) {
  const [profile, setProfile] = useState<ProfileWithUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchProfile() {
      console.log("Fetching profile for user:", user?.id);
      if (!user) {
        console.log("No user found, skipping fetch");
        return;
      }

      try {
        setLoading(true);
        const collection = user.role === "provider" ? "provider_profile" : "client_profile";
        console.log(`Attempting to fetch from ${collection} collection...`);

        try {
          const record = await pb.collection(collection).getFirstListItem<ProfileWithUser>(
            `user = "${user.id}"`,
            {
              expand: "user",
            }
          );
          console.log("Fetched profile:", record);
          setProfile(record);
        } catch (err: any) {
          // If profile doesn't exist (404), create it
          if (err.status === 404) {
            console.log("Profile not found, creating new profile...");
            const newProfile = {
              user: user.id,
              phone: "",
              state: "",
              city: "",
              address: "",
              zip: "",
              ...(user.role === "provider" ? {
                description: "",
                jobs_done: 0,
                experience_years: 0,
                available_days: [],
              } : {}),
            };

            const created = await pb.collection(collection).create<ProfileWithUser>(newProfile, {
              expand: "user",
            });
            console.log("Created new profile:", created);
            setProfile(created);
          } else {
            throw err;
          }
        }
      } catch (err) {
        console.error("Error fetching/creating profile:", err);
        setError(err instanceof Error ? err : new Error("Failed to fetch/create profile"));
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [user, refreshKey]);

  return { profile, loading, error };
} 