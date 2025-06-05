import { useAuthCtx } from "@/context/Auth";
import { pb } from "@/lib/pocketbase";
import { User } from "@/models/User";
import { ClientResponseError } from "pocketbase";

export default function useRegister() {
  const { user, login } = useAuthCtx();

  const registerClient = async (params: RegisterClientParams) => {
    try {
      const formData = new FormData();

      formData.append("name", params.name);
      formData.append("email", params.email);
      formData.append("password", params.password);
      formData.append("passwordConfirm", params.confirmPassword);
      formData.append("role", params.role);

      if (params.avatar) {
        console.log("Avatar URI:", params.avatar);

        formData.append("avatar", {
          uri: params.avatar,
          name: params.avatar.split("/").pop() || `avatar_${Date.now()}.jpg`,
          type: "image/jpeg",
        });
      }

      const newUser = await pb.collection("users").create<User>(formData);

      const location = params.location;

      await pb.collection("client_profile").create({
        user: newUser.id,
        phone: params.phone,
        address: params.address,
        state: params.state,
        city: params.city,
        zip: params.zipCode,
        location,
      });

      const authUser = await pb
        .collection<typeof user>("users")
        .authWithPassword(params.email, params.password);

      login(authUser.record);

      return null;
    } catch (error) {
      if (error instanceof ClientResponseError) {
        console.log("Login message:", error.message);
        console.log("Login data:", error.data);
        console.log("Login error:", error.originalError);
        console.log("Login cause:", error.cause);
        console.log("Login name:", error.name);
        console.log("Login status:", error.status);
        console.log("Login response:", error.response);
      }
      return error;
    }
  };

  const registerProvider = async (params: RegisterProviderParams) => {};

  return { registerClient, registerProvider };
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
