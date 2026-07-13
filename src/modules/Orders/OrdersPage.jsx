import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import PageWrapper from "@/components/PageWrapper/PageWrapper";
import FilterBar, { FilterItem } from "@/components/FilterBar/FilterBar";
import CustomDropdown from "@/components/CustomDropdown/CustomDropdown";
import PagePartnerFilter from "@/components/PagePartnerFilter/PagePartnerFilter";
import { useScopedPartnerParams } from "@/hooks/useScopedPartnerParams";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useLatestRequest } from "@/hooks/useLatestRequest";
import { usePartner } from "@/context/PartnerContext";
import { useAuth } from "@/core/hooks/useAuth";
import { ORDERS_NAMESPACE } from "@/i18n/namespaces";
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
import {
  extractHistoryOrders,
  getDefaultHistoryDateRange,
  isValidHistoryDateRange,
  normalizeHistoryDateRange,
} from "./utils/orderHistoryUtils";
import "./OrdersPage.css";

const MODAL = {
  NONE: null,
  DETAILS: "details",
};

const TAB = {
  ACTIVE: "active",
  HISTORY: "history",
};

const STATUS_FILTER_VALUES = ["", "NEW", "ACCEPTED", "COOKING", "DONE"];

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
  const { t } = useTranslation(ORDERS_NAMESPACE);
  const { notifyNewOrder, notifyAccepted, notifyCooking, notifyStatusChange } =
    useOrderNotification();
  const [orders, setOrders] = useState([]);
  const [historyOrders, setHistoryOrders] = useState([]);
  const [, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(TAB.ACTIVE);
  const [now, setNow] = useState(() => Date.now());

  const [activeModal, setActiveModal] = useState(MODAL.NONE);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { isSuperAdmin } = useAuth();
  const { partnerId } = usePartner();
  const { canFetch, getParams, getOrganizationParams } = useScopedPartnerParams();
  const { beginRequest, isLatestRequest } = useLatestRequest();
  const {
    beginRequest: beginHistoryRequest,
    isLatestRequest: isLatestHistoryRequest,
  } = useLatestRequest();
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 1000);
  const [historyFromDate, setHistoryFromDate] = useState(
    () => getDefaultHistoryDateRange().fromDate
  );
  const [historyToDate, setHistoryToDate] = useState(
    () => getDefaultHistoryDateRange().toDate
  );

  const statusFilterOptions = useMemo(
    () =>
      STATUS_FILTER_VALUES.map((value) => ({
        value,
        label: value
          ? t(`status.${value === "DONE" ? "completed" : value.toLowerCase()}`)
          : t("filters.allStatuses"),
      })),
    [t]
  );

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

  const buildListParams = useCallback(
    () => ({
      status: statusFilter || undefined,
      search: debouncedSearch.trim() || undefined,
    }),
    [statusFilter, debouncedSearch]
  );

  const buildHistoryParams = useCallback(
    () => ({
      fromDate: historyFromDate,
      toDate: historyToDate,
    }),
    [historyFromDate, historyToDate]
  );

  const handleHistoryFromDateChange = useCallback((value) => {
    setHistoryFromDate(value);
    setHistoryToDate((prev) => {
      const normalized = normalizeHistoryDateRange(value, prev);
      return normalized.toDate;
    });
  }, []);

  const handleHistoryToDateChange = useCallback((value) => {
    setHistoryToDate(value);
    setHistoryFromDate((prev) => {
      const normalized = normalizeHistoryDateRange(prev, value);
      return normalized.fromDate;
    });
  }, []);

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
        const listParams = buildListParams();
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
      buildListParams,
      beginRequest,
      isLatestRequest,
    ]
  );

  const fetchHistoryOrders = useCallback(
    async ({ silent = false } = {}) => {
      if (!canFetch) {
        setHistoryOrders([]);
        return;
      }

      if (isSuperAdmin && organizationId == null) {
        setHistoryOrders([]);
        return;
      }

      if (!isValidHistoryDateRange(historyFromDate, historyToDate)) {
        setHistoryOrders([]);
        return;
      }

      const requestId = beginHistoryRequest();

      try {
        if (!silent) setHistoryLoading(true);
        const res = await orderApi.getOrderHistory(
          isSuperAdmin
            ? getOrganizationParams(buildHistoryParams())
            : getParams(buildHistoryParams())
        );

        if (!isLatestHistoryRequest(requestId)) return;

        setHistoryOrders(extractHistoryOrders(res));
      } catch (error) {
        if (!isLatestHistoryRequest(requestId)) return;
        console.error("Order history fetch error:", error);
        setHistoryOrders([]);
      } finally {
        if (!silent && isLatestHistoryRequest(requestId)) {
          setHistoryLoading(false);
        }
      }
    },
    [
      canFetch,
      getParams,
      getOrganizationParams,
      isSuperAdmin,
      organizationId,
      historyFromDate,
      historyToDate,
      buildHistoryParams,
      beginHistoryRequest,
      isLatestHistoryRequest,
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
    fetchHistoryOrders({ silent: activeTab !== TAB.HISTORY });
  }, [fetchHistoryOrders, activeTab]);

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
          notifyAccepted(t("toast.accepted", { order: orderLabel }));
        } else if (action === "process") {
          await orderApi.startCooking(id);
          notifyCooking(t("toast.cookingStarted", { order: orderLabel }));
        } else if (action === "complete") {
          await orderApi.readyOrder(id);
          notifyStatusChange(t("toast.completed", { order: orderLabel }));
        }

        await fetchOrders({ silent: true, skipAlerts: true });
        await fetchHistoryOrders({ silent: true });
      } catch (error) {
        console.error("Order action error:", error);
      }
    },
    [fetchOrders, fetchHistoryOrders, isSuperAdmin, notifyAccepted, notifyCooking, notifyStatusChange, t]
  );

  return (
    <div className="orders-kanban-page">
      <div className="orders-kanban-top page-actions">
        <div>
          <h1>{t("title")}</h1>
          <p>{t("subtitle")}</p>
        </div>
      </div>

      {isSuperAdmin && (
        <FilterBar>
          <FilterItem>
            <PagePartnerFilter partnerLabel={t("filters.organization")} />
          </FilterItem>
        </FilterBar>
      )}

      <FilterBar>
        <FilterItem grow>
          <div className="catalog-filter-search">
            <Search size={16} />
            <input
              type="text"
              placeholder={t("search.placeholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </FilterItem>

        <FilterItem>
          <CustomDropdown
            value={statusFilter}
            onChange={setStatusFilter}
            placeholder={t("filters.allStatuses")}
            clearable
            options={statusFilterOptions}
          />
        </FilterItem>
      </FilterBar>

      <div className="orders-tabs">
        <button
          type="button"
          className={`orders-tab ${activeTab === TAB.ACTIVE ? "active" : ""}`}
          onClick={() => setActiveTab(TAB.ACTIVE)}
        >
          {t("tabs.active")}
          <span className="orders-tab-count">{activeOrders.length}</span>
        </button>
        <button
          type="button"
          className={`orders-tab ${activeTab === TAB.HISTORY ? "active" : ""}`}
          onClick={() => setActiveTab(TAB.HISTORY)}
        >
          {t("tabs.history")}
          <span className="orders-tab-count">{historyOrders.length}</span>
        </button>
      </div>

      {activeTab === TAB.ACTIVE ? (
        !canFetch ? (
          <div className="orders-partner-empty">{t("states.partnerSelect")}</div>
        ) : (
        <div className="orders-board">
          {ORDER_COLUMNS.map((column) => (
            <OrderColumn
              key={column.status}
              label={t(column.labelKey)}
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
        <div className="orders-partner-empty">{t("states.partnerSelect")}</div>
      ) : (
        <>
          <FilterBar className="orders-history-filter-bar">
            <FilterItem auto>
              <label className="orders-history-date-field">
                <span>{t("filters.dateFrom")}</span>
                <input
                  type="date"
                  className="catalog-filter-input"
                  value={historyFromDate}
                  onChange={(e) => handleHistoryFromDateChange(e.target.value)}
                />
              </label>
            </FilterItem>

            <FilterItem auto>
              <label className="orders-history-date-field">
                <span>{t("filters.dateTo")}</span>
                <input
                  type="date"
                  className="catalog-filter-input"
                  value={historyToDate}
                  min={historyFromDate}
                  onChange={(e) => handleHistoryToDateChange(e.target.value)}
                />
              </label>
            </FilterItem>
          </FilterBar>

          <OrderHistoryList
            orders={historyOrders}
            loading={historyLoading}
            onOpenDetails={openDetails}
          />
        </>
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
