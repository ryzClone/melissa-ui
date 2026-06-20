import { clearAllDedupeRequests } from "@/utils/dedupeRequest";

export const AUTH_SESSION_CLEARED_EVENT = "melisa:auth-session-cleared";

const AUTH_LOCAL_STORAGE_KEYS = [
  "token",
  "accessToken",
  "refreshToken",
  "user",
  "selectedPartnerId",
  "selectedOrganizationId",
  "selectedBranchId",
];

export function getStoredAccessToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken") || localStorage.getItem("token");
}

export function clearAuthStorage() {
  if (typeof window === "undefined") return;

  AUTH_LOCAL_STORAGE_KEYS.forEach((key) => {
    localStorage.removeItem(key);
  });

  sessionStorage.clear();
}

export function dispatchAuthSessionCleared() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(AUTH_SESSION_CLEARED_EVENT));
}

export function clearAuthSession(options = {}) {
  const { dispatchEvent = true } = options;

  clearAuthStorage();
  clearAllDedupeRequests();

  if (dispatchEvent) {
    dispatchAuthSessionCleared();
  }
}

export function redirectToLogin() {
  if (typeof window === "undefined") return;
  if (window.location.pathname === "/login") return;
  window.location.href = "/login";
}
