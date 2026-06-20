import { createContext, useEffect, useState } from "react";
import apiClient from "@/core/api/apiClient";
import mainApiClient from "@/api/apiClient";
import endpoints from "@/core/api/endpoints";
import { logAuthTokenDebug } from "@/utils/jwtDebug";
import { isSuperAdmin as checkIsSuperAdmin } from "@/utils/jwtAuth";
import { clearAuthStorage, getStoredAccessToken } from "@/utils/authSession";
import { performLogout as runLogoutCleanup } from "@/utils/performLogout";

export const AuthContext = createContext(null);

function clearAxiosAuthHeaders() {
  delete mainApiClient.defaults?.headers?.common?.Authorization;
  delete apiClient.defaults?.headers?.common?.Authorization;
}

function getStoredUser() {
  const savedUser = localStorage.getItem("user");
  if (savedUser) return JSON.parse(savedUser);
  return { username: "" };
}

function resolveSuperAdminFlag(token) {
  return token ? checkIsSuperAdmin(token) : false;
}

function clearInvalidStoredSession() {
  clearAuthStorage();
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const token = getStoredAccessToken();
      if (token) {
        return getStoredUser();
      }
      return null;
    } catch {
      clearInvalidStoredSession();
      return null;
    }
  });

  const [isSuperAdmin, setIsSuperAdmin] = useState(() =>
    resolveSuperAdminFlag(getStoredAccessToken())
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const token = getStoredAccessToken();

      if (token) {
        setUser(getStoredUser());
        setIsSuperAdmin(resolveSuperAdminFlag(token));
        logAuthTokenDebug(token, "Auth session");
      } else {
        setUser(null);
        setIsSuperAdmin(false);
      }
    } catch {
      clearInvalidStoredSession();
      setUser(null);
      setIsSuperAdmin(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    try {
      runLogoutCleanup({ dispatchEvent: true });
      clearAxiosAuthHeaders();

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

      const superAdmin = resolveSuperAdminFlag(token);
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
      setIsSuperAdmin(superAdmin);

      logAuthTokenDebug(token, "Login");
      if (refreshToken) {
        logAuthTokenDebug(refreshToken, "Login refresh");
      }

      console.log("[Login] API response:", data);

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
    runLogoutCleanup({ dispatchEvent: true });
    clearAxiosAuthHeaders();
    setUser(null);
    setIsSuperAdmin(false);
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, loading, isSuperAdmin }}
    >
      {children}
    </AuthContext.Provider>
  );
}
