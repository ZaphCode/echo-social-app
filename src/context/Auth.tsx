import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { User } from "@/models/User";
import {
  cacheAuthUser,
  getCachedAuthUserById,
} from "@/offline/store";
import { verifyOfflineCredential } from "@/offline/auth";

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
  authMode: "online" | "offline";
  login: (user: User, mode?: "online" | "offline") => void;
  offlineLogin: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authData, setAuthData] = useState({
    user: initialUser,
    authenticated: false,
    authMode: "offline" as "online" | "offline",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        if (profile) {
          await cacheAuthUser(profile, true);
          setAuthData({
            user: profile,
            authenticated: true,
            authMode: "online",
          });
        } else {
          const cachedProfile = await getCachedAuthUserById(session.user.id);
          if (cachedProfile) {
            setAuthData({
              user: cachedProfile,
              authenticated: true,
              authMode: "offline",
            });
          }
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
          await cacheAuthUser(profile, true);
          setAuthData({
            user: profile,
            authenticated: true,
            authMode: "online",
          });
        }
      } else {
        setAuthData({
          user: initialUser,
          authenticated: false,
          authMode: "offline",
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = (user: User, mode: "online" | "offline" = "online") => {
    cacheAuthUser(user, mode === "online");
    setAuthData({ user, authenticated: true, authMode: mode });
  };

  const offlineLogin = async (email: string, password: string) => {
    const cachedUser = await verifyOfflineCredential(email, password);
    if (!cachedUser) return false;

    login(cachedUser, "offline");
    return true;
  };

  const logout = () =>
    setAuthData({
      user: initialUser,
      authenticated: false,
      authMode: "offline",
    });

  if (loading) return null; // Or a splash screen

  return (
    <AuthContext.Provider value={{ ...authData, login, offlineLogin, logout }}>
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
