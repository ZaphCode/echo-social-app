import { useState } from "react";
import { pb } from "@/lib/pocketbase";
import { useAuthCtx } from "@/context/Auth";
import { ClientProfile } from "@/models/ClientProfile";
import { ProviderProfile } from "@/models/ProviderProfile";
import { ClientResponseError } from "pocketbase";

type ProfileRecord = ClientProfile | ProviderProfile;

type UpdateProfileData = {
  phone?: string;
  state?: string;
  city?: string;
  address?: string;
  zip?: string;
  description?: string;
  experience_years?: number;
  available_days?: string[];
};

export default function useUpdateProfile() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthCtx();

  const updateProfile = async (data: UpdateProfileData) => {
    try {
      setLoading(true);
      setError(null);

      if (!pb.authStore.isValid) {
        setError("No estás autenticado");
        return false;
      }

      const collection = user.role === "client" ? "client_profile" : "provider_profile";
      
      const profile = await pb.collection<ProfileRecord>(collection).getFirstListItem(`user = "${user.id}"`);

      if (!profile) {
        setError("No se encontró el perfil");
        return false;
      }

      if (profile.user !== user.id) {
        setError("No tienes permiso para actualizar este perfil");
        return false;
      }

      await pb.collection<ProfileRecord>(collection).update(profile.id, {
        ...data,
        user: user.id,
      });

      await pb.collection("users").authRefresh();

      return true;
    } catch (err) {
      console.error("Error updating profile:", err);
      if (err instanceof ClientResponseError) {
        if (err.status === 403) {
          setError("No tienes permiso para actualizar el perfil");
        } else if (err.status === 404) {
          setError("No se encontró el perfil");
        } else {
          setError("No se pudo actualizar el perfil");
        }
      } else {
        setError("No se pudo actualizar el perfil");
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { updateProfile, loading, error };
} 