import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import PageWrapper from "@/components/PageWrapper/PageWrapper";
import FilterBar, { FilterItem } from "@/components/FilterBar/FilterBar";
import CustomDropdown from "@/components/CustomDropdown/CustomDropdown";
import PagePartnerFilter from "@/components/PagePartnerFilter/PagePartnerFilter";
import { useScopedPartnerParams, PARTNER_SELECT_MESSAGE } from "@/hooks/useScopedPartnerParams";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useLatestRequest } from "@/hooks/useLatestRequest";
import { usePartner } from "@/context/PartnerContext";
import { useAuth } from "@/core/hooks/useAuth";
import OrderColumn from "./components/OrderColumn";
import OrderHistoryList from "./components/OrderHistoryList";
import OrderDetailsModal from "./components/OrderDetailsModal";
import { OrderNotificationProvider } from "./components/OrderNotification/OrderNotificationProvider";
import { useOrderNotification } from "./hooks/useOrderNotification";
import {
  ACTIVE_STATUSES,
  ORDER_COLUMNS,
  MOCK_ORDERS,
  getMerchantOrderId,
  getOrderCustomerName,
  getOrderNumber,
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

const ORDER_STATUS_FILTERS = [
  { value: "", label: "Barcha holatlar" },
  { value: "NEW", label: "Yangi" },
  { value: "ACCEPTED", label: "Qabul qilingan" },
  { value: "COOKING", label: "Tayyorlanmoqda" },
  { value: "DONE", label: "Bajarilgan" },
];

const extractOrders = (res) => {
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

function OrdersPageContent() {
  const { notifyNewOrder, notifyAccepted, notifyCooking, notifyStatusChange } =
    useOrderNotification();
  const [orders, setOrders] = useState([]);
  const [, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(TAB.ACTIVE);
  const [now, setNow] = useState(() => Date.now());

  const [activeModal, setActiveModal] = useState(MODAL.NONE);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { isSuperAdmin } = useAuth();
  const { partnerId } = usePartner();
  const { canFetch, getParams, getOrganizationParams } = useScopedPartnerParams();
  const { beginRequest, isLatestRequest } = useLatestRequest();
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 3000);

  const knownOrderIdsRef = useRef(new Set());
  const isInitialFetchRef = useRef(true);

  const notifyIncomingOrders = useCallback(
    (list, { skipAlerts = false } = {}) => {
      if (skipAlerts || !Array.isArray(list)) return;

      if (isInitialFetchRef.current) {
        isInitialFetchRef.current = false;
        knownOrderIdsRef.current = new Set(list.map((order) => order?.id));
        return;
      }

      list.forEach((order) => {
        const orderId = order?.id;
        if (orderId == null) return;
        if (knownOrderIdsRef.current.has(orderId)) return;
        if (getOrderStatus(order) !== "NEW") return;

        notifyNewOrder(
          `${getOrderNumber(order)} — ${getOrderCustomerName(order)}`
        );
      });

      knownOrderIdsRef.current = new Set(
        list.map((order) => order?.id).filter((id) => id != null)
      );
    },
    [notifyNewOrder]
  );

  const organizationId = useMemo(() => {
    if (!isSuperAdmin || !partnerId) return null;
    const id = Number(partnerId);
    return Number.isFinite(id) ? id : null;
  }, [isSuperAdmin, partnerId]);

  const fetchOrders = useCallback(
    async ({ silent = false, skipAlerts = false } = {}) => {
      if (!canFetch) {
        setOrders([]);
        return;
      }

      if (isSuperAdmin && organizationId == null) {
        setOrders([]);
        return;
      }

      const requestId = beginRequest();

      try {
        if (!silent) setLoading(true);
        const listParams = {
          status: statusFilter || undefined,
          search: debouncedSearch.trim() || undefined,
        };
        const res = await orderApi.getCurrentOrders(
          isSuperAdmin
            ? getOrganizationParams(listParams)
            : getParams(listParams)
        );

        if (!isLatestRequest(requestId)) return;

        const list = extractOrders(res);
        notifyIncomingOrders(list, { skipAlerts });
        setOrders(list);
      } catch (error) {
        if (!isLatestRequest(requestId)) return;
        console.error("Orders fetch error:", error);
        if (!canFetch) {
          setOrders([]);
          return;
        }
        setOrders((prev) => {
          if (prev.length) return prev;
          notifyIncomingOrders(MOCK_ORDERS, { skipAlerts: true });
          return MOCK_ORDERS;
        });
      } finally {
        if (!silent && isLatestRequest(requestId)) {
          setLoading(false);
        }
      }
    },
    [
      notifyIncomingOrders,
      canFetch,
      getParams,
      getOrganizationParams,
      isSuperAdmin,
      organizationId,
      statusFilter,
      debouncedSearch,
      beginRequest,
      isLatestRequest,
    ]
  );

  useEffect(() => {
    fetchOrders();
    const intervalId = setInterval(() => {
      fetchOrders({ silent: true });
    }, 30000);
    return () => clearInterval(intervalId);
  }, [fetchOrders]);

  useEffect(() => {
    isInitialFetchRef.current = true;
    knownOrderIdsRef.current = new Set();
  }, [partnerId, statusFilter, debouncedSearch]);

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
      if (isSuperAdmin) return;

      const id = getMerchantOrderId(order);
      const orderLabel = getOrderNumber(order);

      try {
        if (action === "accept") {
          await orderApi.acceptOrder(id);
          notifyAccepted(`${orderLabel} qabul qilindi`);
        } else if (action === "process") {
          await orderApi.startCooking(id);
          notifyCooking(`${orderLabel} tayyorlashga o'tkazildi`);
        } else if (action === "complete") {
          await orderApi.readyOrder(id);
          notifyStatusChange(`${orderLabel} tayyor bo'ldi`);
        }

        await fetchOrders({ silent: true, skipAlerts: true });
      } catch (error) {
        console.error("Order action error:", error);
      }
    },
    [fetchOrders, isSuperAdmin, notifyAccepted, notifyCooking, notifyStatusChange]
  );

  return (
    <div className="orders-kanban-page">
      <div className="orders-kanban-top page-actions">
        <div>
          <h1>Buyurtmalar</h1>
          <p>Buyurtmalarni holatlar bo'yicha boshqaring</p>
        </div>
      </div>

      {isSuperAdmin && (
        <FilterBar>
          <FilterItem>
            <PagePartnerFilter />
          </FilterItem>
        </FilterBar>
      )}

      <FilterBar>
        <FilterItem grow>
          <div className="catalog-filter-search">
            <Search size={16} />
            <input
              type="text"
              placeholder="Buyurtma qidiruv..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </FilterItem>

        <FilterItem>
          <CustomDropdown
            value={statusFilter}
            onChange={setStatusFilter}
            placeholder="Barcha holatlar"
            clearable
            options={ORDER_STATUS_FILTERS}
          />
        </FilterItem>
      </FilterBar>

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
        !canFetch ? (
          <div className="orders-partner-empty">{PARTNER_SELECT_MESSAGE}</div>
        ) : (
        <div className="orders-board">
          {ORDER_COLUMNS.map((column) => (
            <OrderColumn
              key={column.status}
              label={column.label}
              accent={column.accent}
              orders={ordersByStatus[column.status] || []}
              now={now}
              readOnly={isSuperAdmin}
              onOpenDetails={openDetails}
              onAction={handleCardAction}
            />
          ))}
        </div>
        )
      ) : !canFetch ? (
        <div className="orders-partner-empty">{PARTNER_SELECT_MESSAGE}</div>
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

export default function OrdersPage() {
  return (
    <OrderNotificationProvider>
      <PageWrapper>
        <OrdersPageContent />
      </PageWrapper>
    </OrderNotificationProvider>
  );
}
