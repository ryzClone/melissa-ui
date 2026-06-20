import axios from "axios";
import { globalNotificationService } from "@/services/globalNotificationService";
import {
  isNetworkError,
  isServerOffline,
  isServerUnavailablePage,
} from "@/services/serverStatus";
import { performLogout } from "@/utils/performLogout";
import { redirectToLogin } from "@/utils/authSession";
import { buildHttpRequestKey, dedupeRequest } from "@/utils/dedupeRequest";

const apiClient = axios.create({
  baseURL: "https://dev-api.mtechdynamics.uz",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

const axiosGet = apiClient.get.bind(apiClient);

apiClient.get = (url, config = {}) => {
  if (config?.meta?.skipDedupe) {
    return axiosGet(url, config);
  }

  const key = buildHttpRequestKey("GET", url, config?.params);
  return dedupeRequest(key, () => axiosGet(url, config));
};

const getApiErrorMessage = (error) =>
  error?.response?.data?.errorMessage ||
  error?.response?.data?.message ||
  error?.response?.data?.data?.message ||
  error?.message ||
  null;

const isLoginRequest = (error) => {
  const url = String(error?.config?.url || "");
  return url.includes("/auth/login");
};

const shouldSkipServerUnavailableHandling = (config) =>
  Boolean(config?.meta?.skipServerUnavailableHandling);

const rejectOfflineRequest = () =>
  Promise.reject({
    status: null,
    message: "Server bilan aloqa yo'q",
    data: null,
    isOffline: true,
  });

const notifyApiError = (error) => {
  const status = error?.response?.status;

  if (status === 400) {
    const message = getApiErrorMessage(error) || "Noto'g'ri so'rov yuborildi";
    globalNotificationService.notifyError(message);
    return message;
  }

  if (status === 403) {
    const message = "Ruxsat yo'q";
    globalNotificationService.notifyError(message);
    return message;
  }

  if (status === 404) {
    const message = "Ma'lumot topilmadi";
    globalNotificationService.notifyError(message);
    return message;
  }

  if (status >= 500) {
    const message = "Serverda xatolik yuz berdi";
    globalNotificationService.notifyError(message);
    return message;
  }

  const message = getApiErrorMessage(error) || "Xatolik yuz berdi";
  globalNotificationService.notifyError(message);
  return message;
};

apiClient.interceptors.request.use(
  (config) => {
    if (
      !shouldSkipServerUnavailableHandling(config) &&
      (isServerOffline() || isServerUnavailablePage())
    ) {
      return rejectOfflineRequest();
    }

    const token =
      localStorage.getItem("accessToken") || localStorage.getItem("token");

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (shouldSkipServerUnavailableHandling(error?.config)) {
      return Promise.reject(error);
    }

    const status = error?.response?.status;

    if (isNetworkError(error)) {
      globalNotificationService.notifyError("Server bilan aloqa yo'q");
      return Promise.reject({
        status: null,
        message: "Server bilan aloqa yo'q",
        data: null,
        isOffline: true,
      });
    }

    if (status === 401 && !isLoginRequest(error)) {
      delete apiClient.defaults.headers.common.Authorization;
      performLogout();
      globalNotificationService.notifyError("Sessiya tugadi. Qayta login qiling");
      redirectToLogin();

      return Promise.reject({
        status: 401,
        message: "Sessiya tugadi. Qayta login qiling",
        data: error?.response?.data,
      });
    }

    const message = notifyApiError(error);

    return Promise.reject({
      status,
      message,
      data: error?.response?.data,
    });
  }
);

export default apiClient;
