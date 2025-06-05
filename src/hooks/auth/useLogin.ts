import { useAuthCtx } from "@/context/Auth";
import { pb } from "@/lib/pocketbase";
import { logPBError } from "@/utils/testing";
import { useState } from "react";

export default function useLogin() {
  const [loading, setLoading] = useState(false);
  const auth = useAuthCtx();

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await pb
        .collection<typeof auth.user>("users")
        .authWithPassword(email, password);

      if (!res.record) return "Usuario no encontrado";

      auth.login(res.record);
    } catch (error) {
      if (error instanceof Error) {
        logPBError(error);
        return error.message;
      }
      return "Credenciales incorrectas";
    } finally {
      setLoading(false);
    }
  };

  return {
    login,
    loading,
  };
}
