import apiClient from "@/api/apiClient";
import {
  LAST_PATH_BEFORE_SERVER_DOWN_KEY,
  setServerOnline,
} from "@/services/serverStatus";

export {
  LAST_PATH_BEFORE_SERVER_DOWN_KEY,
  SERVER_UNAVAILABLE_PATH,
  isNetworkError,
  saveLastPathBeforeServerDown,
  redirectToServerUnavailableOnce,
  shouldRedirectToServerUnavailable,
  markServerUnavailableRedirect,
} from "@/services/serverStatus";

const HEALTH_CHECK_META = {
  skipServerUnavailableHandling: true,
  skipErrorNotification: true,
};

function isServerReachableError(error) {
  if (error?.response) return true;
  if (error?.status != null) return true;
  return false;
}

export async function checkServerHealth() {
  try {
    await apiClient.get("/api/v1/profile/me", { meta: HEALTH_CHECK_META });
    return true;
  } catch (error) {
    if (isServerReachableError(error)) return true;
    return false;
  }
}

export function restorePathAfterServerRecovery(navigate) {
  setServerOnline();

  const token =
    localStorage.getItem("accessToken") || localStorage.getItem("token");
  const lastPath = sessionStorage.getItem(LAST_PATH_BEFORE_SERVER_DOWN_KEY);

  sessionStorage.removeItem(LAST_PATH_BEFORE_SERVER_DOWN_KEY);

  if (token) {
    navigate(lastPath || "/", { replace: true });
    return;
  }

  navigate("/login", { replace: true });
}
