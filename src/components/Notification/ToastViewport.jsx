import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import {
  AlertTriangle,
  CheckCircle,
  Info,
  X,
  XCircle,
} from "lucide-react";
import {
  getToastSnapshot,
  removeToast,
  subscribeToasts,
} from "@/services/toastStore";
import "./GlobalToast.css";

const TOAST_ICONS = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

function GlobalToastItem({ notification, onClose }) {
  const Icon = TOAST_ICONS[notification.type] || Info;

  return (
    <div
      className={`global-toast ${notification.type} ${
        notification.exiting ? "exiting" : ""
      }`}
      role="alert"
    >
      <Icon className="global-toast-icon" size={18} />
      <div className="global-toast-content">
        <p className="global-toast-message">{notification.message}</p>
      </div>
      <button
        type="button"
        className="global-toast-close"
        aria-label="Yopish"
        onClick={() => onClose(notification.id)}
      >
        <X size={14} />
      </button>
    </div>
  );
}

export default function ToastViewport() {
  const notifications = useSyncExternalStore(
    subscribeToasts,
    getToastSnapshot,
    () => []
  );

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="global-toast-container" aria-live="polite">
      {notifications.map((notification) => (
        <GlobalToastItem
          key={notification.id}
          notification={notification}
          onClose={removeToast}
        />
      ))}
    </div>,
    document.body
  );
}
