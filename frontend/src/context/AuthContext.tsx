import React, { createContext, useState, useEffect, useContext } from "react";
import type { User, Role } from "../types/auth";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string, role: Role) => Promise<{ success: boolean; message?: string; errors?: Record<string, string> }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          
          // Verify with backend
          const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
          const res = await fetch(`${apiUrl}/auth/me`, {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          });
          
          if (!res.ok) {
            // Token expired or invalid
            logout();
          } else {
            const data = await res.json();
            if (data.success) {
              setUser(data.data);
              localStorage.setItem("user", JSON.stringify(data.data));
            }
          }
        } catch (error) {
          console.error("Auth init error:", error);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string, role: Role) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const { user: loggedUser, token: authToken } = data.data;
        localStorage.setItem("token", authToken);
        localStorage.setItem("user", JSON.stringify(loggedUser));
        setToken(authToken);
        setUser(loggedUser);
        return { success: true };
      } else {
        return {
          success: false,
          message: data.message || "Login failed",
          errors: data.errors,
        };
      }
    } catch (error: unknown) {
      return {
        success: false,
        message: "Unable to connect to the server. Please check if the backend is running.",
      };
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
