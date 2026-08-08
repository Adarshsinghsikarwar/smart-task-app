import React, { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import api from "../lib/api";

interface User {
  _id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStoredAuth() {
      try {
        const storedUser = await SecureStore.getItemAsync("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.error("Failed to load stored auth:", err);
      } finally {
        setLoading(false);
      }
    }
    loadStoredAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await api.post("/auth/login", { email, password });
    const { token, ...userData } = data;
    
    await SecureStore.setItemAsync("token", token);
    await SecureStore.setItemAsync("user", JSON.stringify(userData));
    setUser(userData);
  };

  const signup = async (name: string, email: string, password: string, otp: string) => {
    const { data } = await api.post("/auth/signup", { name, email, password, otp });
    const { token, ...userData } = data;
    
    await SecureStore.setItemAsync("token", token);
    await SecureStore.setItemAsync("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.warn("Server-side logout clearing failed:", err);
    }
    await SecureStore.deleteItemAsync("token");
    await SecureStore.deleteItemAsync("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
