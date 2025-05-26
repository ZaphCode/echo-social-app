import { useAuthCtx } from "@/context/Auth";
import { pb } from "@/lib/pocketbase";
import { useState } from "react";

export default function useLogin() {
  const [error, setError] = useState<string | null>(null);
  const auth = useAuthCtx();

  const login = async (email: string, password: string) => {
    try {
      setError(null); // Reset error state before attempting login
      const res = await pb
        .collection<typeof auth.user>("users")
        .authWithPassword(email, password);

      if (!res.record) {
        setError("No se pudo obtener el usuario");
        return false;
      }

      auth.login(res.record);
      return true;
    } catch (error) {
      setError("Credenciales incorrectas");
      return false;
    }
  };

  return {
    login,
    loginError: error,
  };
}
