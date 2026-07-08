import i18n from "@/i18n";
import { NOTIFICATIONS_NAMESPACE } from "@/i18n/namespaces";
import { pushToast } from "@/services/toastStore";
import { isNetworkError } from "@/services/serverStatus";

const STATUS_ERROR_KEYS = {
  400: "errors.badRequest",
  401: "auth.sessionExpired",
  403: "errors.forbidden",
  404: "errors.notFound",
  500: "errors.server",
};

const MUTATION_SUCCESS_KEYS = {
  POST: "crud.created",
  PUT: "crud.saved",
  PATCH: "crud.saved",
  DELETE: "crud.deleted",
};

function normalizeNotificationKey(message) {
  if (typeof message !== "string") return null;

  const trimmed = message.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith(`${NOTIFICATIONS_NAMESPACE}.`)) {
    return trimmed.slice(NOTIFICATIONS_NAMESPACE.length + 1);
  }

  if (trimmed.startsWith(`${NOTIFICATIONS_NAMESPACE}:`)) {
    return trimmed.slice(NOTIFICATIONS_NAMESPACE.length + 1);
  }

  return trimmed;
}

function hasNotificationKey(key) {
  return Boolean(key && i18n.exists(key, { ns: NOTIFICATIONS_NAMESPACE }));
}

export function translateNotification(message, options = {}) {
  const key = normalizeNotificationKey(message);

  if (key && hasNotificationKey(key)) {
    return i18n.t(key, { ns: NOTIFICATIONS_NAMESPACE, ...options });
  }

  if (typeof message === "string" && message.includes(":")) {
    const [namespace, nestedKey] = message.split(":");
    if (nestedKey && i18n.exists(nestedKey, { ns: namespace })) {
      return i18n.t(nestedKey, { ns: namespace, ...options });
    }
  }

  return message ?? i18n.t("errors.default", { ns: NOTIFICATIONS_NAMESPACE });
}

export function resolveToastMessage(message, options = {}) {
  if (message === undefined || message === null || message === "") {
    return i18n.t(options.defaultKey || "errors.default", {
      ns: NOTIFICATIONS_NAMESPACE,
      ...options,
    });
  }

  const translated = translateNotification(message, options);
  return translated ?? String(message);
}

export function getApiErrorCode(source) {
  const data = source?.response?.data ?? source;

  return (
    data?.errorCode ||
    data?.code ||
    data?.error?.code ||
    data?.data?.errorCode ||
    data?.data?.code ||
    null
  );
}

export function getApiErrorMessage(error) {
  return (
    error?.response?.data?.errorMessage ||
    error?.response?.data?.message ||
    error?.response?.data?.data?.message ||
    error?.message ||
    null
  );
}

export function getResponseErrorMessage(payload) {
  return (
    payload?.errorMessage ||
    payload?.message ||
    payload?.data?.message ||
    null
  );
}

export function resolveApiErrorToast(error, options = {}) {
  const status = error?.response?.status;
  const errorCode = getApiErrorCode(error);
  const codeKey = errorCode ? `errors.codes.${errorCode}` : null;

  if (codeKey && hasNotificationKey(codeKey)) {
    return i18n.t(codeKey, { ns: NOTIFICATIONS_NAMESPACE, ...options });
  }

  if (isNetworkError(error)) {
    return i18n.t("errors.network", { ns: NOTIFICATIONS_NAMESPACE, ...options });
  }

  if (status && STATUS_ERROR_KEYS[status]) {
    return i18n.t(STATUS_ERROR_KEYS[status], {
      ns: NOTIFICATIONS_NAMESPACE,
      ...options,
    });
  }

  const backendMessage = getApiErrorMessage(error);
  if (backendMessage) return backendMessage;

  return i18n.t("errors.default", { ns: NOTIFICATIONS_NAMESPACE, ...options });
}

export function resolveResponsePayloadErrorToast(payload, options = {}) {
  const errorCode = getApiErrorCode(payload);
  const codeKey = errorCode ? `errors.codes.${errorCode}` : null;

  if (codeKey && hasNotificationKey(codeKey)) {
    return i18n.t(codeKey, { ns: NOTIFICATIONS_NAMESPACE, ...options });
  }

  const backendMessage = getResponseErrorMessage(payload);
  if (backendMessage) return backendMessage;

  return i18n.t("errors.default", { ns: NOTIFICATIONS_NAMESPACE, ...options });
}

export function getMutationSuccessMessageKey(method, config) {
  if (config?.meta?.successMessage) {
    return config.meta.successMessage;
  }

  return MUTATION_SUCCESS_KEYS[String(method || "").toUpperCase()] || "crud.saved";
}

export function resolveMutationSuccessMessage(method, config) {
  const messageKey = getMutationSuccessMessageKey(method, config);
  return resolveToastMessage(messageKey);
}

export function showNotification(message, type = "info", options = {}) {
  pushToast(resolveToastMessage(message, options), type);
}

export function showSuccess(message = "common.success", options = {}) {
  pushToast(resolveToastMessage(message, options), "success");
}

export function showError(message = "errors.default", options = {}) {
  pushToast(resolveToastMessage(message, options), "error");
}

export function showWarning(message = "common.warning", options = {}) {
  pushToast(resolveToastMessage(message, options), "warning");
}

export function showInfo(message = "common.info", options = {}) {
  pushToast(resolveToastMessage(message, options), "info");
}
