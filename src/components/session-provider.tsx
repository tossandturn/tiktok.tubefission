"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: string;
  username: string;
  email: string;
  emailVerified: boolean;
}

interface SessionContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; needsVerification?: boolean }>;
  register: (username: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  checkSession: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check session on mount
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const token = localStorage.getItem("session_token");
      if (!token) {
        setIsLoading(false);
        return;
      }

      // In a real app, you would validate the token with your backend
      // For now, we'll parse the user data from localStorage
      const userData = localStorage.getItem("user_data");
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch {
      console.error("Session check failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.needsVerification) {
          return { success: false, needsVerification: true, error: data.error };
        }
        return { success: false, error: data.error || "Login failed" };
      }

      // Store session
      localStorage.setItem("session_token", data.token);
      localStorage.setItem("user_data", JSON.stringify(data.user));
      setUser(data.user);

      return { success: true };
    } catch {
      return { success: false, error: "Network error" };
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || "Registration failed" };
      }

      return { success: true };
    } catch {
      return { success: false, error: "Network error" };
    }
  };

  const logout = () => {
    localStorage.removeItem("session_token");
    localStorage.removeItem("user_data");
    setUser(null);
  };

  return (
    <SessionContext.Provider value={{ user, isLoading, login, register, logout, checkSession }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
