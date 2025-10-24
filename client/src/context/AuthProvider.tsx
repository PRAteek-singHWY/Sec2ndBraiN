import React, { useState, useEffect, ReactNode } from "react";
import axios from "axios";
import { AuthContext, UserProfile } from "./AuthContext";
import { BACKEND_URL } from "../config";

// These helper functions are perfect. No changes needed.
function getInitials(nameOrUsername?: string | null): string {
  if (!nameOrUsername) return "U";
  return nameOrUsername
    .trim()
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function enrichUser(user: UserProfile | null): UserProfile | null {
  if (!user) return null;
  return {
    ...user,
    profilePic: user.profilePic || null,
    initials: getInitials(user.name || user.username || user.email),
  };
}

// Set axios to send credentials (cookies) with every request
axios.defaults.withCredentials = true;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // We no longer store the token in state.
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // This helper function is still perfect.
  const updateUser: React.Dispatch<React.SetStateAction<UserProfile | null>> = (
    newUser
  ) => {
    setUser((prev) => {
      const finalUser = typeof newUser === "function" ? newUser(prev) : newUser;
      return enrichUser(finalUser);
    });
  };

  // Login now only needs the user object. The cookie is already set by the server.
  const login = (newUser: UserProfile) => {
    updateUser(newUser);
  };

  // Logout must now call the server to clear the httpOnly cookie.
  const logout = async () => {
    try {
      // Tell the server to clear the cookie
      await axios.post(`${BACKEND_URL}/api/v1/logout`);
    } catch (err) {
      console.error("Logout API call failed, but clearing client state.", err);
    } finally {
      // Always clear the user from React's state
      updateUser(null);
    }
  };

  // This useEffect now runs ONCE on app load to check if we have a valid cookie.
  useEffect(() => {
    const verifyUser = async () => {
      try {
        // We don't send any headers. The browser AUTOMATICALLY sends the cookie.
        const res = await axios.get(`${BACKEND_URL}/api/v1/verify-token`);

        // If the request succeeds, the cookie was valid and we get the user
        if (res.data?.user) {
          updateUser(res.data.user);
        }
      } catch {
        // If it fails (403, 404, etc.), we don't have a valid cookie.
        updateUser(null);
      } finally {
        // We're done checking, so stop loading.
        setLoading(false);
      }
    };

    verifyUser();
  }, []); // The empty array [] means this runs only once on mount.

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user, // Authentication is now based on having a user
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
