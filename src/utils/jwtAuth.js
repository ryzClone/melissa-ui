import { decodeJwtToken } from "@/utils/jwtDebug";
import { getStoredAccessToken } from "@/utils/authSession";

export function getAccessTokenPayload(token = getStoredAccessToken()) {
  if (!token) return null;
  return decodeJwtToken(token)?.payload ?? null;
}

/** Global Super Admin check: decoded JWT payload.sub === "admin" */
export function isSuperAdminFromPayload(payload) {
  return payload?.sub === "admin";
}

/** Returns true when access token belongs to Super Admin (sub === "admin"). */
export function isSuperAdmin(token = getStoredAccessToken()) {
  return isSuperAdminFromPayload(getAccessTokenPayload(token));
}
