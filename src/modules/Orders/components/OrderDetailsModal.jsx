import { useTranslation } from "react-i18next";
import { X, MapPin, Phone, Building2 } from "lucide-react";
import { ORDERS_NAMESPACE } from "@/i18n/namespaces";
import {
  formatSom,
  getItemKey,
  getProductName,
  getProductQuantity,
  getProductTotalPrice,
  getOrderAvatar,
  getOrderBranchAddress,
  getOrderBranchName,
  getOrderBranchPhone,
  getOrderCustomerName,
  getOrderDateTimeLabel,
  getOrderDiscountedAmount,
  getOrderItems,
  getOrderNumber,
  getOrderPhone,
  getOrderTotalAmount,
} from "./OrderMockData";

export default function OrderDetailsModal({ open, order, onClose }) {
  const { t } = useTranslation(ORDERS_NAMESPACE);

  if (!open || !order) return null;

  const name = getOrderCustomerName(order);
  const avatar = getOrderAvatar(order);
  const items = getOrderItems(order);
  const discount = getOrderDiscountedAmount(order);

  return (
    <div className="orders-modal-overlay" onClick={onClose}>
      <div
        className="orders-modal orders-modal-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="orders-modal-header">
          <div>
            <span className="orders-modal-kicker">{t("modal.kicker")}</span>
            <h2>{getOrderNumber(order)}</h2>
            <span className="orders-detail-time">
              {getOrderDateTimeLabel(order)}
            </span>
          </div>
          <button
            type="button"
            className="orders-modal-close"
            onClick={onClose}
            aria-label={t("buttons.close")}
          >
            <X size={18} />
          </button>
        </header>

        <div className="orders-modal-body">
          <div className="orders-detail-customer">
            <div className="orders-card-avatar lg">
              {avatar ? (
                <img src={avatar} alt={name} />
              ) : (
                <span>{name?.[0]}</span>
              )}
            </div>
            <div>
              <strong>{name}</strong>
              <span className="orders-detail-muted">
                <Phone size={13} />
                {getOrderPhone(order)}
              </span>
            </div>
          </div>

          <div className="orders-detail-section">
            <h4>{t("details.products")}</h4>
            <ul className="orders-detail-items">
              {items.map((item, index) => (
                <li key={getItemKey(item, index)}>
                  <span className="orders-detail-item-qty">
                    {getProductQuantity(item)}×
                  </span>
                  <span className="orders-detail-item-name">
                    {getProductName(item)}
                  </span>
                  <span className="orders-detail-item-price">
                    {formatSom(getProductTotalPrice(item))}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="orders-detail-box">
            <span className="orders-detail-label">
              <Building2 size={13} /> {t("details.branch")}
            </span>
            <p>{getOrderBranchName(order)}</p>
            <span className="orders-detail-branch-line">
              <Phone size={12} /> {getOrderBranchPhone(order)}
            </span>
            <span className="orders-detail-branch-line">
              <MapPin size={12} /> {getOrderBranchAddress(order)}
            </span>
          </div>

          <div className="orders-detail-total-group">
            {discount > 0 && (
              <div className="orders-detail-subline">
                <span>{t("details.discount")}</span>
                <span>-{formatSom(discount)}</span>
              </div>
            )}
            <div className="orders-detail-total">
              <span>{t("details.totalAmount")}</span>
              <strong>{formatSom(getOrderTotalAmount(order))}</strong>
            </div>
          </div>
        </div>

        <footer className="orders-modal-footer">
          <button type="button" className="orders-btn ghost" onClick={onClose}>
            {t("buttons.close")}
          </button>
        </footer>
      </div>
    </div>
  );
}
