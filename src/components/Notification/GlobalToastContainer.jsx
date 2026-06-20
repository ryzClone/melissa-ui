import {
  AlertTriangle,
  CheckCircle,
  Info,
  X,
  XCircle,
} from "lucide-react";
import { useGlobalNotification } from "@/hooks/useGlobalNotification";
import "./GlobalToast.css";

const ICONS = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

function GlobalToastItem({ notification, onClose }) {
  const Icon = ICONS[notification.type] || Info;

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

export default function GlobalToastContainer() {
  const { notifications, removeNotification } = useGlobalNotification();

  return (
    <div className="global-toast-container">
      {notifications.map((notification) => (
        <GlobalToastItem
          key={notification.id}
          notification={notification}
          onClose={removeNotification}
        />
      ))}
    </div>
  );
}
