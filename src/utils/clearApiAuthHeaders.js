import mainApiClient from "@/api/apiClient";
import coreApiClient from "@/core/api/apiClient";

export function clearApiAuthHeaders() {
  if (mainApiClient?.defaults?.headers?.common) {
    delete mainApiClient.defaults.headers.common.Authorization;
  }

  if (coreApiClient?.defaults?.headers?.common) {
    delete coreApiClient.defaults.headers.common.Authorization;
  }
}
