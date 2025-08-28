import React, { useState, useEffect, ReactNode } from "react";
import axios from "axios";
import { AuthContext, UserProfile } from "./AuthContext";
import { BACKEND_URL } from "../config";

// 📝 Helper: get initials
function getInitials(nameOrUsername?: string | null): string {
  if (!nameOrUsername) return "U"; // fallback
  return nameOrUsername
    .trim()
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

// 📝 Enrich user object with defaults
function enrichUser(user: UserProfile | null): UserProfile | null {
  if (!user) return null;

  return {
    ...user,
    profilePic: user.profilePic || null,
    initials: getInitials(user.name || user.username || user.email),
  };
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [user, setUser] = useState<UserProfile | null>(null); // ✅ no localStorage
  const [loading, setLoading] = useState(true);

  // wrapper around setUser (enrich only, do not persist)
  const updateUser: React.Dispatch<React.SetStateAction<UserProfile | null>> = (
    newUser
  ) => {
    setUser((prev) => {
      const finalUser = typeof newUser === "function" ? newUser(prev) : newUser;
      return enrichUser(finalUser);
    });
  };

  const login = (newToken: string, newUser?: UserProfile) => {
    setToken(newToken);
    localStorage.setItem("token", newToken); // keep token persistent

    if (newUser) updateUser(newUser);
  };

  const logout = () => {
    setToken(null);
    updateUser(null);
    localStorage.removeItem("token");
  };

  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          const res = await axios.get(`${BACKEND_URL}/api/v1/verify-token`, {
            headers: { token },
          });
          if (res.data?.user) updateUser(res.data.user);
        } catch {
          logout();
        }
      }
      setLoading(false);
    };
    verifyToken();
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!token,
        token,
        user,
        setUser: updateUser,
        login,
        logout,
      }}
    >
      {loading ? <div>Loading...</div> : children}
    </AuthContext.Provider>
  );
};
