import {
  createContext,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import OrderNotificationContainer from "./OrderNotificationContainer";

const MAX_ORDER_ALERTS = 5;
const AUTO_DISMISS_MS = 5000;
const EXIT_ANIMATION_MS = 240;

export const OrderNotificationContext = createContext(null);

const createAlertId = () => `${Date.now()}-${Math.random()}`;

export function OrderNotificationProvider({ children }) {
  const [alerts, setAlerts] = useState([]);
  const timersRef = useRef(new Map());
  const exitTimersRef = useRef(new Map());

  const clearTimer = useCallback((id) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const removeOrderAlert = useCallback(
    (id) => {
      clearTimer(id);

      setAlerts((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, exiting: true } : item
        )
      );

      const exitTimer = setTimeout(() => {
        setAlerts((prev) => prev.filter((item) => item.id !== id));
        exitTimersRef.current.delete(id);
      }, EXIT_ANIMATION_MS);

      exitTimersRef.current.set(id, exitTimer);
    },
    [clearTimer]
  );

  const showOrderAlert = useCallback(
    ({ message, type = "status" }) => {
      if (!message) return;

      const id = createAlertId();

      setAlerts((prev) => {
        let next = [...prev, { id, message, type }];

        if (next.length > MAX_ORDER_ALERTS) {
          const removed = next.slice(0, next.length - MAX_ORDER_ALERTS);
          removed.forEach((item) => clearTimer(item.id));
          next = next.slice(next.length - MAX_ORDER_ALERTS);
        }

        return next;
      });

      const timer = setTimeout(() => {
        removeOrderAlert(id);
      }, AUTO_DISMISS_MS);

      timersRef.current.set(id, timer);
    },
    [removeOrderAlert, clearTimer]
  );

  const notifyNewOrder = useCallback(
    (message) => showOrderAlert({ message, type: "new" }),
    [showOrderAlert]
  );

  const notifyAccepted = useCallback(
    (message) => showOrderAlert({ message, type: "accepted" }),
    [showOrderAlert]
  );

  const notifyCooking = useCallback(
    (message) => showOrderAlert({ message, type: "cooking" }),
    [showOrderAlert]
  );

  const notifyStatusChange = useCallback(
    (message) => showOrderAlert({ message, type: "status" }),
    [showOrderAlert]
  );

  const value = useMemo(
    () => ({
      alerts,
      showOrderAlert,
      notifyNewOrder,
      notifyAccepted,
      notifyCooking,
      notifyStatusChange,
      removeOrderAlert,
    }),
    [
      alerts,
      showOrderAlert,
      notifyNewOrder,
      notifyAccepted,
      notifyCooking,
      notifyStatusChange,
      removeOrderAlert,
    ]
  );

  return (
    <OrderNotificationContext.Provider value={value}>
      {children}
      <OrderNotificationContainer />
    </OrderNotificationContext.Provider>
  );
}
