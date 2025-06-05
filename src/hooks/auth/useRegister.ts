import { useAuthCtx } from "@/context/Auth";
import { pb } from "@/lib/pocketbase";
import { User } from "@/models/User";
import { ClientResponseError } from "pocketbase";

export default function useRegister() {
  const { user, login } = useAuthCtx();

  // Función interna para crear usuario y autenticar
  const createUserAndLogin = async (params: RegisterClientParams) => {
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

    const authUser = await pb
      .collection<typeof user>("users")
      .authWithPassword(params.email, params.password);

    login(authUser.record);

    return newUser;
  };

  const registerClient = async (params: RegisterClientParams) => {
    try {
      const newUser = await createUserAndLogin(params);

      await pb.collection("client_profile").create({
        user: newUser.id,
        phone: params.phone,
        address: params.address,
        state: params.state,
        city: params.city,
        zip: params.zipCode,
        location: params.location,
      });

      return null;
    } catch (error) {
      handlePBError(error);
      return error;
    }
  };

  const registerProvider = async (params: RegisterProviderParams) => {
    try {
      const newUser = await createUserAndLogin(params);

      await pb.collection("provider_profile").create({
        user: newUser.id,
        phone: params.phone,
        address: params.address,
        state: params.state,
        city: params.city,
        zip: params.zipCode,
        location: params.location,
        description: params.description,
        experience_years: params.experience_years,
        available_days: params.available_days,
      });

      return null;
    } catch (error) {
      handlePBError(error);
      return error;
    }
  };

  return { registerClient, registerProvider };
}

function handlePBError(error: unknown) {
  if (error instanceof ClientResponseError) {
    console.log("PB Error message:", error.message);
    console.log("PB Error data:", error.data);
    console.log("PB Error originalError:", error.originalError);
    console.log("PB Error cause:", error.cause);
    console.log("PB Error name:", error.name);
    console.log("PB Error status:", error.status);
    console.log("PB Error response:", error.response);
  } else {
    console.log("Unknown error:", error);
  }
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
  zipCode: string;
  location?: {
    lat: number;
    lon: number;
  };
};

type RegisterProviderParams = RegisterClientParams & {
  description: string;
  experience_years: number;
  available_days: string[];
};
