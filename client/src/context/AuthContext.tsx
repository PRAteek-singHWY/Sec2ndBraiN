import { createContext } from "react";

export interface UserProfile {
  username: string | null;
  email?: string | null;
  name?: string | null;
  profilePic?: string | null;
}

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  user: UserProfile | null;
  login: (token: string, user?: UserProfile) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  token: null,
  user: null,
  login: () => {},
  logout: () => {},
});
