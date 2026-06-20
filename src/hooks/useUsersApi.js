import { useAuth } from "@/core/hooks/useAuth";
import { organizationUserApi } from "@/api/modules/organizationUserApi";
import { userControllerUsersApi } from "@/api/modules/userControllerApi";

/**
 * Merchant users: GET/POST/PUT/DELETE /api/v1/merchant-user
 * Super Admin users: GET /api/v1/user/merchant-users?organizationId=..., view-only
 */
export function useUsersApi() {
  const { isSuperAdmin } = useAuth();
  return isSuperAdmin ? userControllerUsersApi : organizationUserApi;
}
