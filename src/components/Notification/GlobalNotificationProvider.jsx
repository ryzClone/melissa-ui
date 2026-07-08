import {
  createContext,
  useCallback,
  useMemo,
  useSyncExternalStore,
} from "react";
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

export const GlobalNotificationContext = createContext(null);

export function GlobalNotificationProvider({ children }) {
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

  const value = useMemo(
    () => ({
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
      removeNotification: removeToast,
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

  return (
    <GlobalNotificationContext.Provider value={value}>
      {children}
    </GlobalNotificationContext.Provider>
  );
}

