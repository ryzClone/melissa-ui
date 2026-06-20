import { clearAuthSession } from "@/utils/authSession";

/** Clears persisted auth/session data and notifies app contexts to reset. */
export function performLogout(options = {}) {
  clearAuthSession(options);
}
