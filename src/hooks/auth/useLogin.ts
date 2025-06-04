import { useAuthCtx } from "@/context/Auth";
import { pb } from "@/lib/pocketbase";
import { ClientResponseError } from "pocketbase";
import { useState } from "react";

export default function useLogin() {
  const [error, setError] = useState<string | null>(null);
  const auth = useAuthCtx();

  const login = async (email: string, password: string) => {
    try {
      const res = await pb
        .collection<typeof auth.user>("users")
        .authWithPassword(email, password);

      if (!res.record) return setError("No se pudo obtener el usuario");

      auth.login(res.record);
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

      setError("Credenciales incorrectas");
    }
  };

  return {
    login,
    loginError: error,
  };
}
