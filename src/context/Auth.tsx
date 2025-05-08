import { createContext, useContext, useState } from "react";
import { pb } from "../lib/pocketbase";

const initialUser = {
  id: "",
  email: "",
  role: "",
  created: "",
  avatar: "",
};

type AuthUser = typeof initialUser;

type AuthContextType = {
  user: AuthUser;
  authenticated: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authData, setAuthData] = useState(
    pb.authStore.isValid
      ? {
          user: {
            id: pb.authStore.record!.id,
            email: pb.authStore.record!.email,
            role: pb.authStore.record!.role,
            created: pb.authStore.record!.created,
            avatar: pb.authStore.record!.avatar,
          },
          authenticated: true,
        }
      : {
          user: initialUser,
          authenticated: false,
        }
  );

  const login = (user: AuthUser) => setAuthData({ user, authenticated: true });
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
