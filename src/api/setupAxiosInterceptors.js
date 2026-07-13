import { pushToast } from "@/services/toastStore";
import {
  resolveApiErrorToast,
  resolveMutationSuccessMessage,
  resolveResponsePayloadErrorToast,
  resolveToastMessage,
  showError,
} from "@/services/notificationI18n";
import {
  isNetworkError,
  isServerOffline,
  isServerUnavailablePage,
} from "@/services/serverStatus";
import { performLogout } from "@/utils/performLogout";
import { redirectToLogin } from "@/utils/authSession";
import { getAcceptLanguageHeader } from "@/i18n/language";

export { getApiErrorMessage, getResponseErrorMessage } from "@/services/notificationI18n";

export const getApiSuccessMessage = (response) =>
  response?.data?.message ||
  response?.data?.data?.message ||
  null;

export const getResponsePayload = (response) => response?.data;

export const hasResponseError = (payload) => {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return false;
  }

  const errorMessage = payload.errorMessage;
  return typeof errorMessage === "string" && errorMessage.trim().length > 0;
};

export const getResponseMethod = (response) => {
  const config = response?.config;

  return String(
    config?.meta?._httpMethod ||
      config?.method ||
      response?.request?.method ||
      ""
  ).toUpperCase();
};

export function isLoginRequest(configOrError) {
  const url = String(
    configOrError?.config?.url ||
      configOrError?.url ||
      configOrError?.baseURL ||
      ""
  );
  return url.includes("/auth/login");
}

export const shouldSkipServerUnavailableHandling = (config) =>
  Boolean(config?.meta?.skipServerUnavailableHandling);

export const shouldSkipSuccessNotification = (config) =>
  Boolean(config?.meta?.skipSuccessNotification) || isLoginRequest(config);

export const shouldSkipErrorNotification = (config) =>
  Boolean(config?.meta?.skipErrorNotification) || isLoginRequest(config);

export const getMutationSuccessMessage = (method, config) =>
  resolveMutationSuccessMessage(method, config);

const notifyApiError = (error) => {
  const config = error?.config;
  const message = resolveApiErrorToast(error);

  if (!shouldSkipErrorNotification(config)) {
    pushToast(message, "error");
  }

  return message;
};

export const isAxiosConfig = (value) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  if (typeof FormData !== "undefined" && value instanceof FormData) return false;
  if (typeof Blob !== "undefined" && value instanceof Blob) return false;
  return (
    "headers" in value ||
    "meta" in value ||
    "params" in value ||
    "signal" in value ||
    "timeout" in value ||
    "responseType" in value
  );
};

export const extractAxiosConfig = (args) => {
  for (let index = args.length - 1; index >= 0; index -= 1) {
    const value = args[index];
    if (isAxiosConfig(value)) return value;
  }
  return {};
};

export const notifyMutationSuccess = (method, config, data) => {
  if (hasResponseError(data)) {
    if (!shouldSkipErrorNotification(config)) {
      pushToast(resolveResponsePayloadErrorToast(data), "error");
    }
    return;
  }

  if (shouldSkipSuccessNotification(config)) return;

  pushToast(getMutationSuccessMessage(method, config), "success");
};

const handleGetInfoNotification = (response) => {
  const config = response?.config;
  const method = getResponseMethod(response);

  if (method !== "GET" || !config?.meta?.notifyInfo) return;

  const infoMessage =
    typeof config.meta.notifyInfo === "string"
      ? resolveToastMessage(config.meta.notifyInfo, {
          defaultKey: "common.infoLoaded",
        })
      : resolveToastMessage("common.infoLoaded");

  pushToast(infoMessage, "info");
};

export function attachMutationToastHandlers(client) {
  ["post", "put", "patch", "delete"].forEach((method) => {
    const original = client[method].bind(client);

    client[method] = (...args) => {
      const config = extractAxiosConfig(args);
      const requestUrl = typeof args[0] === "string" ? args[0] : "";
      const requestConfig = {
        ...config,
        url: config.url || requestUrl,
      };

      return original(...args).then((data) => {
        notifyMutationSuccess(method.toUpperCase(), requestConfig, data);
        return data;
      });
    };
  });
}

const rejectOfflineRequest = () => {
  const message = resolveToastMessage("errors.network");

  showError("errors.network");

  return Promise.reject({
    status: null,
    message,
    data: null,
    isOffline: true,
  });
};

export function setupAxiosInterceptors(client, options = {}) {
  const {
    unwrapResponse = false,
    enableServerOfflineGuard = false,
  } = options;

  client.interceptors.request.clear();
  client.interceptors.response.clear();

  client.interceptors.request.use(
    (config) => {
      config.meta = {
        ...(config.meta || {}),
        _httpMethod: String(config.method || "GET").toUpperCase(),
      };

      if (
        enableServerOfflineGuard &&
        !shouldSkipServerUnavailableHandling(config) &&
        (isServerOffline() || isServerUnavailablePage())
      ) {
        return rejectOfflineRequest();
      }

      config.headers = config.headers || {};
      config.headers["Accept-Language"] = getAcceptLanguageHeader();

      const token =
        localStorage.getItem("accessToken") || localStorage.getItem("token");

      if (token && !isLoginRequest(config)) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  client.interceptors.response.use(
    (response) => {
      handleGetInfoNotification(response);
      return unwrapResponse ? response.data : response;
    },
    (error) => {
      const config = error?.config;

      if (shouldSkipServerUnavailableHandling(config)) {
        return Promise.reject(error);
      }

      const status = error?.response?.status;

      if (isNetworkError(error)) {
        const message = resolveApiErrorToast(error);

        if (!shouldSkipErrorNotification(config)) {
          pushToast(message, "error");
        }

        return Promise.reject({
          status: null,
          message,
          data: null,
          isOffline: true,
        });
      }

      if (status === 401 && !isLoginRequest(error)) {
        delete client.defaults.headers.common.Authorization;
        performLogout();

        const message = resolveApiErrorToast(error);

        pushToast(message, "error");
        redirectToLogin();

        return Promise.reject({
          status: 401,
          message,
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
}
