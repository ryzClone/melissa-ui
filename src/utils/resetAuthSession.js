import { clearAuthSession } from "@/utils/authSession";
import { clearApiAuthHeaders } from "@/utils/clearApiAuthHeaders";

/** Full logout/session reset: storage, axios headers, and context listeners. */
export function resetAuthSession(options = {}) {
  clearAuthSession(options);
  clearApiAuthHeaders();
}
