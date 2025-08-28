import { createContext } from "react";

export interface UserProfile {
  username: string | null;
  email?: string | null;
  name?: string | null;
  profilePic?: string | null;
  phone?: string | null;
  initials?: string;
  bio?: string | null;
}

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  user: UserProfile | null;

  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  login: (token: string, user?: UserProfile) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  token: null,
  user: null,
  setUser: () => {},
  login: () => {},
  logout: () => {},
});
