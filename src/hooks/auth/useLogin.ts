import { useAuthCtx } from "@/context/Auth";
import { pb } from "@/lib/pocketbase";
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
      setError("Credenciales incorrectas");
    }
  };

  return {
    login,
    loginError: error,
  };
}
