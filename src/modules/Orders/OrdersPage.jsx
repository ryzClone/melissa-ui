import { useCallback, useEffect, useMemo, useState } from "react";
import OrderColumn from "./components/OrderColumn";
import OrderHistoryList from "./components/OrderHistoryList";
import OrderDetailsModal from "./components/OrderDetailsModal";
import {
  ACTIVE_STATUSES,
  ORDER_COLUMNS,
  MOCK_ORDERS,
  getMerchantOrderId,
  getOrderStatus,
} from "./components/OrderMockData";
import { orderApi } from "./api/orderApi";
import "./OrdersPage.css";

const MODAL = {
  NONE: null,
  DETAILS: "details",
};

const TAB = {
  ACTIVE: "active",
  HISTORY: "history",
};

const extractOrders = (res) => {
  // Tolerant to apiClient unwrapping and various nesting shapes.
  const list =
    res?.data?.data?.content ||
    res?.data?.data ||
    res?.data?.content ||
    res?.data ||
    res ||
    [];
  if (Array.isArray(list)) return list;
  if (Array.isArray(list?.content)) return list.content;
  return [];
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(TAB.ACTIVE);
  const [now, setNow] = useState(() => Date.now());

  const [activeModal, setActiveModal] = useState(MODAL.NONE);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Refreshes only the background `orders` list. Modal state is never touched
  // here, so an open modal keeps its own snapshot of the selected order.
  const fetchOrders = useCallback(async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);
      const res = await orderApi.getCurrentOrders();
      const list = extractOrders(res);
      setOrders(list);
    } catch (error) {
      console.error("Orders fetch error:", error);
      // Fallback to mock data only when no orders are loaded yet.
      setOrders((prev) => (prev.length ? prev : MOCK_ORDERS));
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  // Initial fetch + auto-refresh every 30s (no full page reload).
  useEffect(() => {
    fetchOrders();
    const intervalId = setInterval(() => {
      fetchOrders({ silent: true });
    }, 30000);
    return () => clearInterval(intervalId);
  }, [fetchOrders]);

  // Per-second tick that drives the NEW SLA countdown on the cards.
  useEffect(() => {
    const tickId = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tickId);
  }, []);

  const activeOrders = useMemo(
    () => orders.filter((order) => ACTIVE_STATUSES.includes(getOrderStatus(order))),
    [orders]
  );

  const historyOrders = useMemo(
    () => orders.filter((order) => !ACTIVE_STATUSES.includes(getOrderStatus(order))),
    [orders]
  );

  const ordersByStatus = useMemo(() => {
    const grouped = {};
    ORDER_COLUMNS.forEach((column) => {
      grouped[column.status] = [];
    });
    activeOrders.forEach((order) => {
      const status = getOrderStatus(order);
      if (grouped[status]) grouped[status].push(order);
    });
    return grouped;
  }, [activeOrders]);

  const closeModal = useCallback(() => {
    setActiveModal(MODAL.NONE);
    setSelectedOrder(null);
  }, []);

  const openDetails = useCallback((order) => {
    setSelectedOrder(order);
    setActiveModal(MODAL.DETAILS);
  }, []);

  const handleCardAction = useCallback(
    async (action, order) => {
      const id = getMerchantOrderId(order);
      try {
        if (action === "accept") {
          await orderApi.acceptOrder(id);
        } else if (action === "process") {
          await orderApi.startCooking(id);
        } else if (action === "complete") {
          await orderApi.readyOrder(id);
        }
        await fetchOrders({ silent: true });
      } catch (error) {
        console.error("Order action error:", error);
      }
    },
    [fetchOrders]
  );

  return (
    <div className="orders-kanban-page">
      <div className="orders-kanban-top">
        <div>
          <h1>Buyurtmalar</h1>
          <p>Buyurtmalarni holatlar bo'yicha boshqaring</p>
        </div>
      </div>

      <div className="orders-tabs">
        <button
          type="button"
          className={`orders-tab ${activeTab === TAB.ACTIVE ? "active" : ""}`}
          onClick={() => setActiveTab(TAB.ACTIVE)}
        >
          Jarayondagi buyurtmalar
          <span className="orders-tab-count">{activeOrders.length}</span>
        </button>
        <button
          type="button"
          className={`orders-tab ${activeTab === TAB.HISTORY ? "active" : ""}`}
          onClick={() => setActiveTab(TAB.HISTORY)}
        >
          History
          <span className="orders-tab-count">{historyOrders.length}</span>
        </button>
      </div>

      {activeTab === TAB.ACTIVE ? (
        <div className="orders-board">
          {ORDER_COLUMNS.map((column) => (
            <OrderColumn
              key={column.status}
              label={column.label}
              accent={column.accent}
              orders={ordersByStatus[column.status] || []}
              now={now}
              onOpenDetails={openDetails}
              onAction={handleCardAction}
            />
          ))}
        </div>
      ) : (
        <OrderHistoryList orders={historyOrders} onOpenDetails={openDetails} />
      )}

      <OrderDetailsModal
        open={activeModal === MODAL.DETAILS}
        order={selectedOrder}
        onClose={closeModal}
      />
    </div>
  );
}
