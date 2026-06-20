export const SERVER_UNAVAILABLE_PATH = "/server-unavailable";
export const LAST_PATH_BEFORE_SERVER_DOWN_KEY = "lastPathBeforeServerDown";

export const SERVER_STATUS = {
  ONLINE: "online",
  OFFLINE: "offline",
};

let serverStatus = SERVER_STATUS.ONLINE;
let hasRedirectedToUnavailable = false;

export function getServerStatus() {
  return serverStatus;
}

export function isServerOffline() {
  return serverStatus === SERVER_STATUS.OFFLINE;
}

export function isServerOnline() {
  return serverStatus === SERVER_STATUS.ONLINE;
}

export function setServerOffline() {
  serverStatus = SERVER_STATUS.OFFLINE;
}

export function setServerOnline() {
  serverStatus = SERVER_STATUS.ONLINE;
  hasRedirectedToUnavailable = false;
}

export function isServerUnavailablePage() {
  if (typeof window === "undefined") return false;
  return window.location.pathname === SERVER_UNAVAILABLE_PATH;
}

export function shouldRedirectToServerUnavailable() {
  if (isServerUnavailablePage()) return false;
  if (hasRedirectedToUnavailable) return false;
  if (isServerOffline()) return false;
  return true;
}

export function markServerUnavailableRedirect() {
  hasRedirectedToUnavailable = true;
  setServerOffline();
}

export function initServerStatusFromLocation() {
  if (isServerUnavailablePage()) {
    markServerUnavailableRedirect();
  }
}

export function saveLastPathBeforeServerDown() {
  if (typeof window === "undefined") return;

  const currentPath = window.location.pathname + window.location.search;
  if (currentPath === SERVER_UNAVAILABLE_PATH) return;

  sessionStorage.setItem(LAST_PATH_BEFORE_SERVER_DOWN_KEY, currentPath);
}

/**
 * True when the server/domain is unreachable (DNS, wrong baseURL, connection refused).
 * False when the server responded — even 404 means the backend is up.
 */
export function isNetworkError(error) {
  if (error?.response) return false;

  return (
    !error.response ||
    error.code === "ERR_NETWORK" ||
    error.message === "Network Error" ||
    String(error?.message || "").includes("Network Error")
  );
}

export function redirectToServerUnavailableOnce() {
  if (typeof window === "undefined") return;
  if (!shouldRedirectToServerUnavailable()) return;

  saveLastPathBeforeServerDown();
  markServerUnavailableRedirect();
  window.location.href = SERVER_UNAVAILABLE_PATH;
}
