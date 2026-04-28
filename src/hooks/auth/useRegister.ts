import { useState } from "react";

import { supabase } from "@/lib/supabase";
import { User } from "@/models/User";
import { logError } from "@/utils/testing";
import { resolveStorageUrl } from "@/api/storage";
import useLogin from "./useLogin";

export default function useRegister() {
  const { login, loading: loginLoading } = useLogin();
  const [registrationLoading, setRegistrationLoading] = useState(false);

  const createUser = async (params: RegisterClientParams) => {
    // Sign up via Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: params.email,
      password: params.password,
      options: {
        data: {
          name: params.name,
          role: params.role,
          email_visibility: true,
        },
      },
    });

    if (error) throw error;
    if (!data.user) throw new Error("User creation failed");

    // Update profile with additional fields if needed
    const updates: Record<string, unknown> = {};
    if (params.location) {
      updates.location = params.location;
    }
    if (params.avatar) {
      // Upload avatar to storage
      const fileName = `${data.user.id}/avatar_${Date.now()}.jpg`;
      const response = await fetch(params.avatar);
      const blob = await response.blob();

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, blob, { contentType: "image/jpeg" });

      if (!uploadError) {
        updates.avatar = resolveStorageUrl("avatars", fileName);
      }
    }

    if (Object.keys(updates).length > 0) {
      await supabase
        .from("profiles")
        .update(updates)
        .eq("id", data.user.id);
    }

    return { id: data.user.id } as { id: string };
  };

  const registerClient = async (params: RegisterClientParams) => {
    setRegistrationLoading(true);
    try {
      const newUser = await createUser(params);

      await supabase.from("client_profile").insert({
        user: newUser.id,
        phone: params.phone,
        address: params.address,
        state: params.state,
        city: params.city,
        zip: params.zip,
      });

      const loginError = await login(params.email, params.password);

      if (loginError) return new Error("Login failed after registration");

      return null;
    } catch (error) {
      logError(error);
      return error;
    } finally {
      setRegistrationLoading(false);
    }
  };

  const registerProvider = async (params: RegisterProviderParams) => {
    setRegistrationLoading(true);
    try {
      const { id } = await createUser(params);

      await supabase.from("provider_profile").insert({
        user: id,
        phone: params.phone,
        description: params.description,
        specialty: params.specialty,
        experience_years: params.experience_years,
        available_days: params.available_days,
        address: params.address,
        state: params.state,
        city: params.city,
        zip: params.zip,
      });

      const loginError = await login(params.email, params.password);

      if (loginError) return new Error("Login failed after registration");

      return null;
    } catch (error) {
      logError(error);
      return error;
    } finally {
      setRegistrationLoading(false);
    }
  };

  return {
    registerClient,
    registerProvider,
    loading: registrationLoading || loginLoading,
  };
}

// Types

type RegisterClientParams = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: User["role"];
  avatar?: string;
  phone: string;
  address: string;
  state: string;
  city: string;
  zip: string;
  location?: {
    lat: number;
    lon: number;
  };
};

type RegisterProviderParams = RegisterClientParams & {
  description: string;
  specialty: string;
  experience_years: number;
  available_days: string[];
};
