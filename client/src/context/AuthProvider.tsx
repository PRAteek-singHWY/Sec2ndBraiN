import React, { useState, useEffect, ReactNode } from "react";
import axios from "axios";
import { AuthContext, UserProfile } from "./AuthContext";
import { BACKEND_URL } from "../config";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [user, setUser] = useState<UserProfile | null>(
    localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")!) : null
  );
  const [loading, setLoading] = useState(true);

  const login = (newToken: string, newUser?: UserProfile) => {
    setToken(newToken);
    localStorage.setItem("token", newToken);
    if (newUser) {
      setUser(newUser);
      localStorage.setItem("user", JSON.stringify(newUser));
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          const res = await axios.get(`${BACKEND_URL}/api/v1/verify-token`, {
            headers: { token },
          });
          if (res.data?.user) {
            setUser(res.data.user);
            localStorage.setItem("user", JSON.stringify(res.data.user));
          }
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
      value={{ isAuthenticated: !!token, token, user, login, logout }}
    >
      {loading ? <div>Loading...</div> : children}
    </AuthContext.Provider>
  );
};
