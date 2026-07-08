import axios from "axios";
import "@/services/toastStore";
import {
  attachMutationToastHandlers,
  setupAxiosInterceptors,
} from "@/api/setupAxiosInterceptors";
import { buildHttpRequestKey, dedupeRequest } from "@/utils/dedupeRequest";

const apiClient = axios.create({
  baseURL: "https://dev-api.mtechdynamics.uz",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

setupAxiosInterceptors(apiClient, {
  unwrapResponse: true,
  enableServerOfflineGuard: true,
});

attachMutationToastHandlers(apiClient);

const axiosGet = apiClient.get.bind(apiClient);

apiClient.get = (url, config = {}) => {
  if (config?.meta?.skipDedupe) {
    return axiosGet(url, config);
  }

  const key = buildHttpRequestKey("GET", url, config?.params);
  return dedupeRequest(key, () => axiosGet(url, config));
};

export default apiClient;
