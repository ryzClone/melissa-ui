import { useTranslation } from "react-i18next";
import { Bell, ChefHat, ClipboardCheck, PackagePlus, X } from "lucide-react";
import { ORDERS_NAMESPACE } from "@/i18n/namespaces";
import "./OrderNotification.css";

const ALERT_TYPE_KEYS = {
  new: "notifications.newOrder",
  accepted: "notifications.accepted",
  cooking: "notifications.cooking",
  status: "notifications.statusUpdated",
};

const ALERT_ICONS = {
  new: PackagePlus,
  accepted: ClipboardCheck,
  cooking: ChefHat,
  status: Bell,
};

export default function OrderAlert({ alert, onClose }) {
  const { t } = useTranslation(ORDERS_NAMESPACE);
  const titleKey = ALERT_TYPE_KEYS[alert.type] || ALERT_TYPE_KEYS.status;
  const Icon = ALERT_ICONS[alert.type] || ALERT_ICONS.status;

  return (
    <div
      className={`order-alert ${alert.type} ${alert.exiting ? "exiting" : ""}`}
      role="status"
    >
      <Icon className="order-alert-icon" size={18} />
      <div className="order-alert-content">
        <p className="order-alert-title">{t(titleKey)}</p>
        <p className="order-alert-message">{alert.message}</p>
      </div>
      <button
        type="button"
        className="order-alert-close"
        aria-label={t("buttons.close")}
        onClick={() => onClose(alert.id)}
      >
        <X size={14} />
      </button>
    </div>
  );
}
