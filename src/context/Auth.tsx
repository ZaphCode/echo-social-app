import { createContext, useContext, useState } from "react";
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
  const [authData, setAuthData] = useState(
    pb.authStore.isValid
      ? {
          user: {
            id: pb.authStore.record!.id,
            name: pb.authStore.record!.name,
            email: pb.authStore.record!.email,
            role: pb.authStore.record!.role,
            created: pb.authStore.record!.created,
            avatar: pb.authStore.record!.avatar,
            updated: pb.authStore.record!.updated,
            emailVisibility: pb.authStore.record!.emailVisibility,
            verified: pb.authStore.record!.verified,
          } as User,
          authenticated: true,
        }
      : {
          user: initialUser,
          authenticated: false,
        }
  );

  const login = (user: User) => setAuthData({ user, authenticated: true });
  const logout = () => setAuthData({ user: initialUser, authenticated: false });

  return (
    <AuthContext.Provider value={{ ...authData, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthCtx = () => {
  return useContext(AuthContext);
};
