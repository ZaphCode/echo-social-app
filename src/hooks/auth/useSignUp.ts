import { useState } from "react";
import { pb } from "@/lib/pocketbase";
import { User } from "@/models/User";
import { useAuthCtx } from "@/context/Auth";

type SignUpData = {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
  role: "client" | "provider";
};

export default function useSignUp() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const auth = useAuthCtx();

  const signUp = async (data: SignUpData) => {
    try {
      setLoading(true);
      setError(null);

      // Create the user record
      const userData = {
        name: data.name,
        email: data.email,
        password: data.password,
        passwordConfirm: data.passwordConfirm,
        role: data.role,
        emailVisibility: true, // Make email visible by default
      };

      // First create the user
      await pb.collection("users").create(userData);

      // Then try to authenticate
      try {
        const authData = await pb
          .collection("users")
          .authWithPassword(data.email, data.password);

        if (!authData.record) {
          throw new Error("Failed to authenticate after registration");
        }

        // Cast the record to User type with required fields
        const user: User = {
          id: authData.record.id,
          name: authData.record.name,
          email: authData.record.email,
          role: authData.record.role as "client" | "provider",
          created: authData.record.created,
          updated: authData.record.updated,
          avatar: authData.record.avatar || "",
          emailVisibility: authData.record.emailVisibility || false,
          verified: authData.record.verified || false,
        };

        auth.login(user);
        return true;
      } catch (authError: any) {
        console.error("Auth error after signup:", authError);
        // If auth fails, we still created the user, so we can try to login again
        if (authError.status === 400) {
          setError("Error al iniciar sesión después del registro. Por favor, intenta iniciar sesión manualmente.");
        } else {
          setError("Error al iniciar sesión después del registro. Por favor, intenta iniciar sesión manualmente.");
        }
        return false;
      }
    } catch (err: any) {
      console.error("Sign up error:", err);
      if (err.data?.data) {
        // Handle PocketBase validation errors
        const errors = err.data.data;
        if (errors.email) setError(errors.email.message);
        else if (errors.password) setError(errors.password.message);
        else if (errors.passwordConfirm) setError(errors.passwordConfirm.message);
        else if (errors.name) setError(errors.name.message);
        else setError("Error al crear la cuenta");
      } else {
        setError("Error al crear la cuenta");
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    signUp,
    signUpError: error,
    loading,
  };
} 