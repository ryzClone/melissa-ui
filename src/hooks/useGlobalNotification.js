import { useContext, useCallback, useMemo } from "react";
import { useSyncExternalStore } from "react";
import { GlobalNotificationContext } from "@/components/Notification/GlobalNotificationProvider";
import {
  getToastSnapshot,
  pushToast,
  removeToast,
  subscribeToasts,
} from "@/services/toastStore";
import {
  showError,
  showInfo,
  showSuccess,
  showWarning,
  resolveToastMessage,
} from "@/services/notificationI18n";

const buildFallbackApi = () => ({
  notifications: getToastSnapshot(),
  addNotification: (input, messageArg) => {
    if (input && typeof input === "object") {
      pushToast(resolveToastMessage(input.message), input.type || "info");
      return;
    }

    if (messageArg !== undefined) {
      pushToast(resolveToastMessage(messageArg), input || "info");
      return;
    }

    pushToast(resolveToastMessage(input), "info");
  },
  showNotification: (message, type = "info", options) =>
    pushToast(resolveToastMessage(message, options), type),
  success: (message, options) => showSuccess(message, options),
  error: (message, options) => showError(message, options),
  warning: (message, options) => showWarning(message, options),
  info: (message, options) => showInfo(message, options),
  showSuccess: (message, options) => showSuccess(message, options),
  showError: (message, options) => showError(message, options),
  showWarning: (message, options) => showWarning(message, options),
  showInfo: (message, options) => showInfo(message, options),
  removeNotification: removeToast,
});

export function useGlobalNotification() {
  const context = useContext(GlobalNotificationContext);
  const notifications = useSyncExternalStore(
    subscribeToasts,
    getToastSnapshot,
    () => []
  );

  const addNotification = useCallback((input, messageArg) => {
    if (input && typeof input === "object") {
      pushToast(resolveToastMessage(input.message), input.type || "info");
      return;
    }

    if (messageArg !== undefined) {
      pushToast(resolveToastMessage(messageArg), input || "info");
      return;
    }

    pushToast(resolveToastMessage(input), "info");
  }, []);

  const showNotification = useCallback((message, type = "info", options) => {
    pushToast(resolveToastMessage(message, options), type);
  }, []);

  const success = useCallback(
    (message, options) => showSuccess(message, options),
    []
  );

  const error = useCallback(
    (message, options) => showError(message, options),
    []
  );

  const warning = useCallback(
    (message, options) => showWarning(message, options),
    []
  );

  const info = useCallback(
    (message, options) => showInfo(message, options),
    []
  );

  const fallback = useMemo(
    () => ({
      ...buildFallbackApi(),
      notifications,
      addNotification,
      showNotification,
      success,
      error,
      warning,
      info,
      showSuccess: success,
      showError: error,
      showWarning: warning,
      showInfo: info,
    }),
    [
      notifications,
      addNotification,
      showNotification,
      success,
      error,
      warning,
      info,
    ]
  );

  if (!context) {
    return fallback;
  }

  return {
    ...context,
    notifications,
    addNotification: context.addNotification || addNotification,
  };
}

export function useNotification() {
  return useGlobalNotification();
}

export default useGlobalNotification;

