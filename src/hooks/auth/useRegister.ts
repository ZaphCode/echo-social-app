import { pb } from "@/lib/pocketbase";
import { User } from "@/models/User";
import { logPBError } from "@/utils/testing";
import useLogin from "./useLogin";
import { useState } from "react";
import { set } from "react-hook-form";
import { loadAsync } from "expo-font";

export default function useRegister() {
  const { login, loading: loginLoading } = useLogin();
  const [registrationLoading, setRegistrationLoading] = useState(false);

  const createUser = async (params: RegisterClientParams) => {
    const formData = new FormData();

    formData.append("name", params.name);
    formData.append("email", params.email);
    formData.append("password", params.password);
    formData.append("passwordConfirm", params.confirmPassword);
    formData.append("role", params.role);
    formData.append("emailVisibility", true);

    if (params.avatar) {
      formData.append("avatar", {
        uri: params.avatar,
        name: params.avatar.split("/").pop() || `avatar_${Date.now()}.jpg`,
        type: "image/jpeg",
      });
    }

    const newUser = await pb.collection("users").create<User>(formData);

    return newUser;
  };

  const registerClient = async (params: RegisterClientParams) => {
    setRegistrationLoading(true);
    try {
      const newUser = await createUser(params);

      await pb.collection("client_profile").create({
        user: newUser.id,
        ...params,
      });

      const loginError = await login(params.email, params.password);

      if (loginError) return new Error("Login failed after registration");

      return null;
    } catch (error) {
      logPBError(error);
      return error;
    } finally {
      setRegistrationLoading(false);
    }
  };

  const registerProvider = async (params: RegisterProviderParams) => {
    setRegistrationLoading(true);
    try {
      const { id } = await createUser(params);

      await pb.collection("provider_profile").create({
        user: id,
        ...params,
      });

      const loginError = await login(params.email, params.password);

      if (loginError) return new Error("Login failed after registration");

      return null;
    } catch (error) {
      logPBError(error);
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
