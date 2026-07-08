import { useTranslation } from "react-i18next";
import { Clock, Phone, MapPin, Building2, Timer, AlertTriangle, Eye } from "lucide-react";
import { ORDERS_NAMESPACE } from "@/i18n/namespaces";
import {
  formatSom,
  formatRemainingTime,
  getItemKey,
  getProductName,
  getProductQuantity,
  getOrderAvatar,
  getOrderBranchName,
  getOrderBranchAddress,
  getOrderCustomerName,
  getOrderNumber,
  getOrderItems,
  getOrderPhone,
  getOrderStatus,
  getOrderTimeLabel,
  getOrderTotalAmount,
  getRemainingMs,
} from "./OrderMockData";

const WARN_THRESHOLD_MS = 30000;

function SlaBadge({ order, now }) {
  const { t } = useTranslation(ORDERS_NAMESPACE);
  const remaining = getRemainingMs(order, now);
  if (remaining == null) return null;

  const overdue = remaining < 0;
  const warning = !overdue && remaining <= WARN_THRESHOLD_MS;
  const tone = overdue ? "overdue" : warning ? "warning" : "normal";

  return (
    <span className={`orders-sla-badge ${tone}`}>
      {overdue ? <AlertTriangle size={12} /> : <Timer size={12} />}
      {overdue
        ? t("timer.expired")
        : t("timer.remaining", { time: formatRemainingTime(remaining) })}
    </span>
  );
}

function CustomerAvatar({ name, avatar }) {
  const initials = (name || "?")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="orders-card-avatar">
      {avatar ? (
        <img
          src={avatar}
          alt={name}
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}

export default function OrderCard({ order, now, readOnly = false, onOpenDetails, onAction }) {
  const { t } = useTranslation(ORDERS_NAMESPACE);
  const status = getOrderStatus(order);
  const isNew = status === "NEW";
  const isAccepted = status === "ACCEPTED";
  const isCooking = status === "COOKING";

  const items = getOrderItems(order);
  const visibleItems = items.slice(0, 3);
  const hiddenCount = items.length - visibleItems.length;

  const stop = (event, fn) => {
    event.stopPropagation();
    fn?.();
  };

  return (
    <article
      className="orders-card"
      role="button"
      tabIndex={0}
      onClick={() => onOpenDetails?.(order)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpenDetails?.(order);
        }
      }}
    >
      <header className="orders-card-top">
        <span className="orders-card-id">{getOrderNumber(order)}</span>
        <span className="orders-card-time">
          <Clock size={13} />
          {getOrderTimeLabel(order)}
        </span>
      </header>

      {isNew && (
        <div className="orders-card-status-row">
          <SlaBadge order={order} now={now} />
        </div>
      )}

      <div className="orders-card-customer">
        <CustomerAvatar
          name={getOrderCustomerName(order)}
          avatar={getOrderAvatar(order)}
        />
        <div className="orders-card-customer-info">
          <strong>{getOrderCustomerName(order)}</strong>
          <span>
            <Phone size={12} />
            {getOrderPhone(order)}
          </span>
        </div>
      </div>

      <ul className="orders-card-items">
        {visibleItems.map((item, index) => (
          <li key={getItemKey(item, index)}>
            <span className="orders-card-item-qty">
              {getProductQuantity(item)}×
            </span>
            <span className="orders-card-item-name">{getProductName(item)}</span>
          </li>
        ))}
        {hiddenCount > 0 && (
          <li className="orders-card-items-more">
            {t("details.itemsMore", { count: hiddenCount })}
          </li>
        )}
      </ul>

      <div className="orders-card-meta">
        <span className="orders-card-branch">
          <Building2 size={12} />
          {getOrderBranchName(order)}
        </span>
        <span
          className="orders-card-address"
          title={getOrderBranchAddress(order)}
        >
          <MapPin size={12} />
          {getOrderBranchAddress(order)}
        </span>
      </div>

      <footer className="orders-card-footer">
        <div className="orders-card-total">
          <span>{t("details.total")}</span>
          <strong>{formatSom(getOrderTotalAmount(order))}</strong>
        </div>

        <div className="orders-card-actions">
          {readOnly ? (
            <button
              type="button"
              className="orders-btn ghost full"
              onClick={(e) => stop(e, () => onOpenDetails?.(order))}
            >
              <Eye size={14} />
              {t("buttons.view")}
            </button>
          ) : (
            <>
              {isNew && (
                <button
                  type="button"
                  className="orders-btn primary full"
                  onClick={(e) => stop(e, () => onAction?.("accept", order))}
                >
                  {t("buttons.accept")}
                </button>
              )}

              {isAccepted && (
                <button
                  type="button"
                  className="orders-btn primary full"
                  onClick={(e) => stop(e, () => onAction?.("process", order))}
                >
                  {t("buttons.startCooking")}
                </button>
              )}

              {isCooking && (
                <button
                  type="button"
                  className="orders-btn success full"
                  onClick={(e) => stop(e, () => onAction?.("complete", order))}
                >
                  {t("buttons.complete")}
                </button>
              )}
            </>
          )}
        </div>
      </footer>
    </article>
  );
}
