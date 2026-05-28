import { createContext, useEffect, useState } from "react";
import apiClient from "@/core/api/apiClient";
import endpoints from "@/core/api/endpoints";

export const AuthContext = createContext(null);

function getStoredToken() {
  return localStorage.getItem("accessToken") || localStorage.getItem("token");
}

function getStoredUser() {
  const savedUser = localStorage.getItem("user");
  if (savedUser) return JSON.parse(savedUser);
  return { username: "" };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const token = getStoredToken();

      if (token) {
        return getStoredUser();
      }

      return null;
    } catch (error) {
      localStorage.removeItem("token");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const token = getStoredToken();

      if (token) {
        setUser(getStoredUser());
      } else {
        setUser(null);
      }
    } catch (error) {
      localStorage.removeItem("token");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    try {
      const response = await apiClient.post(endpoints.auth.login, {
        username,
        password,
      });

      const data = response.data;

      const token = data?.data?.accessToken;
      const refreshToken = data?.data?.refreshToken || null;

      if (!token) {
        return {
          success: false,
          message: "Token topilmadi",
        };
      }

      const userData = {
        username,
      };

      localStorage.setItem("accessToken", token);
      localStorage.setItem("token", token);

      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
      } else {
        localStorage.removeItem("refreshToken");
      }

      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);

      return { success: true };
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Login qilishda xatolik yuz berdi";

      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}