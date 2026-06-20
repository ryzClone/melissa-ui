import { Bell, ChefHat, ClipboardCheck, PackagePlus, X } from "lucide-react";
import "./OrderNotification.css";

const ALERT_META = {
  new: { title: "Yangi buyurtma", Icon: PackagePlus },
  accepted: { title: "Qabul qilindi", Icon: ClipboardCheck },
  cooking: { title: "Jarayonda", Icon: ChefHat },
  status: { title: "Buyurtma yangilandi", Icon: Bell },
};

export default function OrderAlert({ alert, onClose }) {
  const meta = ALERT_META[alert.type] || ALERT_META.status;
  const Icon = meta.Icon;

  return (
    <div
      className={`order-alert ${alert.type} ${alert.exiting ? "exiting" : ""}`}
      role="status"
    >
      <Icon className="order-alert-icon" size={18} />
      <div className="order-alert-content">
        <p className="order-alert-title">{meta.title}</p>
        <p className="order-alert-message">{alert.message}</p>
      </div>
      <button
        type="button"
        className="order-alert-close"
        aria-label="Yopish"
        onClick={() => onClose(alert.id)}
      >
        <X size={14} />
      </button>
    </div>
  );
}
