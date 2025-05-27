import { createContext, useContext, useState, useEffect } from "react";
import { pb } from "../lib/pocketbase";
import { User } from "@/models/User";

const initialUser: User = {
  id: "",
  email: "",
  name: "",
  role: "client",
  created: "",
  updated: "",
  avatar: "",
  emailVisibility: false,
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

  // Clear auth state on app initialization
  useEffect(() => {
    pb.authStore.clear();
  }, []);

  const login = (user: User) => setAuthData({ user, authenticated: true });
  const logout = () => {
    pb.authStore.clear();
    setAuthData({ user: initialUser, authenticated: false });
  };

  return (
    <AuthContext.Provider value={{ ...authData, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthCtx = () => {
  return useContext(AuthContext);
};
