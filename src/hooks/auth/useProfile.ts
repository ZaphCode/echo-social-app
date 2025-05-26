import { useEffect, useState } from "react";
import { useAuthCtx } from "@/context/Auth";
import { pb } from "@/lib/pocketbase";
import { ClientProfile } from "@/models/ClientProfile";
import { ProviderProfile } from "@/models/ProviderProfile";
import { ClientResponseError } from "pocketbase";

type ProfileRecord = ClientProfile | ProviderProfile;

export default function useProfile() {
  const { user } = useAuthCtx();
  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const collection = user.role === "client" ? "client_profile" : "provider_profile";
      const record = await pb.collection<ProfileRecord>(collection).getFirstListItem(`user = "${user.id}"`, {
        expand: "user",
      });

      setProfile(record as ProfileRecord);
    } catch (err) {
      console.error("Error fetching profile:", err);
      if (err instanceof ClientResponseError && err.status === 404) {
        try {
          const collection = user.role === "client" ? "client_profile" : "provider_profile";
          const newProfile = await pb.collection<ProfileRecord>(collection).create({
            user: user.id,
            phone: "",
            state: "",
            city: "",
            address: "",
            zip: "",
            ...(user.role === "provider" && {
              description: "",
              jobs_done: 0,
              experience_years: 0,
              available_days: [],
            }),
          });
          setProfile(newProfile as ProfileRecord);
        } catch (createErr) {
          console.error("Error creating profile:", createErr);
          setError("No se pudo crear el perfil");
        }
      } else {
        setError("No se pudo cargar el perfil");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user.id) {
      fetchProfile();
    }
  }, [user.id, user.role]);

  return { profile, loading, error, refetch: fetchProfile };
} 