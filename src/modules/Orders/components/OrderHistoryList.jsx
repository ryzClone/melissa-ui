import { Clock, Phone, Building2 } from "lucide-react";
import {
  formatSom,
  getOrderBranchName,
  getOrderCustomerName,
  getOrderDateTimeLabel,
  getOrderItems,
  getOrderNumber,
  getOrderPhone,
  getOrderStatus,
  getOrderTotalAmount,
  getStatusBadge,
  getProductQuantity,
} from "./OrderMockData";

function HistoryRow({ order, onOpenDetails }) {
  const badge = getStatusBadge(getOrderStatus(order));
  const itemsCount = getOrderItems(order).reduce(
    (sum, item) => sum + getProductQuantity(item),
    0
  );

  return (
    <article
      className="orders-history-item"
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
      <div className="orders-history-main">
        <span className="orders-history-id">{getOrderNumber(order)}</span>
        <strong className="orders-history-name">
          {getOrderCustomerName(order)}
        </strong>
        <span className="orders-history-muted">
          <Phone size={12} />
          {getOrderPhone(order)}
        </span>
      </div>

      <span className="orders-history-branch">
        <Building2 size={12} />
        {getOrderBranchName(order)}
      </span>

      <span className="orders-history-count">{itemsCount} ta mahsulot</span>

      <span className="orders-history-total">
        {formatSom(getOrderTotalAmount(order))}
      </span>

      <span className={`orders-status-badge ${badge.tone}`}>{badge.label}</span>

      <span className="orders-history-time">
        <Clock size={12} />
        {getOrderDateTimeLabel(order)}
      </span>
    </article>
  );
}

export default function OrderHistoryList({ orders = [], onOpenDetails }) {
  if (orders.length === 0) {
    return (
      <div className="orders-history-empty">
        Tarixda buyurtmalar yo'q
      </div>
    );
  }

  return (
    <div className="orders-history-list">
      {orders.map((order, index) => (
        <HistoryRow
          key={order?.id ?? order?.orderId ?? index}
          order={order}
          onOpenDetails={onOpenDetails}
        />
      ))}
    </div>
  );
}
