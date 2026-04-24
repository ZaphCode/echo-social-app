import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { User } from "@/models/User";

const initialUser: User = {
  id: "",
  email: "",
  name: "",
  role: "client",
  created_at: "",
  updated_at: "",
  avatar: "",
  email_visibility: false,
  verified: false,
};

type AuthContextType = {
  user: User;
  authenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authData, setAuthData] = useState({
    user: initialUser,
    authenticated: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        if (profile) {
          setAuthData({ user: profile, authenticated: true });
        }
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        if (profile) {
          setAuthData({ user: profile, authenticated: true });
        }
      } else {
        setAuthData({ user: initialUser, authenticated: false });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = (user: User) => setAuthData({ user, authenticated: true });
  const logout = () => setAuthData({ user: initialUser, authenticated: false });

  if (loading) return null; // Or a splash screen

  return (
    <AuthContext.Provider value={{ ...authData, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

async function fetchProfile(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    role: data.role,
    avatar: data.avatar || "",
    email_visibility: data.email_visibility,
    verified: data.verified,
    created_at: data.created_at,
    updated_at: data.updated_at,
    location: data.location || undefined,
  };
}

export const useAuthCtx = () => {
  return useContext(AuthContext);
};
