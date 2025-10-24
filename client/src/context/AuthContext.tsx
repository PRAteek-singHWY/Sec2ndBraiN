import { createContext } from "react";

// UserProfile interface is perfect, no changes needed.
export interface UserProfile {
  username: string | null;
  email?: string | null;
  name?: string | null;
  profilePic?: string | null;
  phone?: string | null;
  initials?: string;
  bio?: string | null;
}

// --- THIS IS THE UPDATED PART ---
interface AuthContextType {
  isAuthenticated: boolean;
  user: UserProfile | null;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  // Login no longer receives a token, just the user
  login: (user: UserProfile) => void; 
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  setUser: () => {},
  login: () => {}, // Updated default
  logout: () => {},
});