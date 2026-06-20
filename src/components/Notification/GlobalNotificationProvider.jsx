import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { globalNotificationService } from "@/services/globalNotificationService";

const MAX_TOASTS = 5;
const AUTO_DISMISS_MS = 3000;
const EXIT_ANIMATION_MS = 240;

export const GlobalNotificationContext = createContext(null);

const createToastId = () => `${Date.now()}-${Math.random()}`;

export function GlobalNotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const timersRef = useRef(new Map());
  const exitTimersRef = useRef(new Map());

  const clearTimer = useCallback((id) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const removeNotification = useCallback(
    (id) => {
      clearTimer(id);

      setNotifications((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, exiting: true } : item
        )
      );

      const exitTimer = setTimeout(() => {
        setNotifications((prev) => prev.filter((item) => item.id !== id));
        exitTimersRef.current.delete(id);
      }, EXIT_ANIMATION_MS);

      exitTimersRef.current.set(id, exitTimer);
    },
    [clearTimer]
  );

  const showNotification = useCallback(
    (message, type = "info") => {
      if (!message) return;

      const id = createToastId();

      setNotifications((prev) => {
        let next = [...prev, { id, message, type }];

        if (next.length > MAX_TOASTS) {
          const removed = next.slice(0, next.length - MAX_TOASTS);
          removed.forEach((item) => clearTimer(item.id));
          next = next.slice(next.length - MAX_TOASTS);
        }

        return next;
      });

      const timer = setTimeout(() => {
        removeNotification(id);
      }, AUTO_DISMISS_MS);

      timersRef.current.set(id, timer);
    },
    [removeNotification, clearTimer]
  );

  const success = useCallback(
    (message) => showNotification(message, "success"),
    [showNotification]
  );

  const error = useCallback(
    (message) => showNotification(message, "error"),
    [showNotification]
  );

  const warning = useCallback(
    (message) => showNotification(message, "warning"),
    [showNotification]
  );

  const info = useCallback(
    (message) => showNotification(message, "info"),
    [showNotification]
  );

  useEffect(() => {
    globalNotificationService.setNotificationHandler({
      showNotification,
      success,
      error,
      warning,
      info,
      removeNotification,
    });

    return () => {
      globalNotificationService.setNotificationHandler(null);
      timersRef.current.forEach((timer) => clearTimeout(timer));
      timersRef.current.clear();
      exitTimersRef.current.forEach((timer) => clearTimeout(timer));
      exitTimersRef.current.clear();
    };
  }, [
    showNotification,
    success,
    error,
    warning,
    info,
    removeNotification,
  ]);

  const value = useMemo(
    () => ({
      notifications,
      showNotification,
      success,
      error,
      warning,
      info,
      removeNotification,
    }),
    [
      notifications,
      showNotification,
      success,
      error,
      warning,
      info,
      removeNotification,
    ]
  );

  return (
    <GlobalNotificationContext.Provider value={value}>
      {children}
    </GlobalNotificationContext.Provider>
  );
}
