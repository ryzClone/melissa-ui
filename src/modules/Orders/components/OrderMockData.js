/**
 * Orders shared constants + field-mapping helpers.
 *
 * Real API: GET /api/v1/merchant-order/current -> res.data.data = [...]
 * Each order: { id, orderId, orderNumber, orderTime, customerName,
 *   customerPhoneNumber, totalAmount, discountedAmount, merchantOrderStatus,
 *   orderStatus, estimatedPreparationMinutes, confirmationDeadlineAt,
 *   startCookingEnabled, branch{ id,name,phone,address },
 *   orderProducts[{ id, productId, productName, quantity, unitPrice,
 *   totalPrice, discountPrice, discountPercentage }] }
 *
 * Flow: NEW -> ACCEPTED -> COOKING -> (DONE / ...) .
 * Helpers stay tolerant so the MOCK_ORDERS fallback also renders.
 */

export const ORDER_STATUS = {
  NEW: "NEW",
  ACCEPTED: "ACCEPTED",
  COOKING: "COOKING",
};

export const ORDER_COLUMNS = [
  { status: "NEW", label: "Yangi", accent: "orange" },
  { status: "ACCEPTED", label: "Qabul qilinganlar", accent: "blue" },
  { status: "COOKING", label: "Jarayondagilar", accent: "purple" },
];

export const ACTIVE_STATUSES = ["NEW", "ACCEPTED", "COOKING"];

/* ---------- Status labels / badges ---------- */

const STATUS_LABELS = {
  NEW: "Yangi",
  ACCEPTED: "Qabul qilingan",
  COOKING: "Jarayonda",
  DONE: "Bajarildi",
  READY: "Tayyor",
  DELIVERING: "Yetkazilmoqda",
  DELIVERED: "Yetkazildi",
  REJECTED: "Rad etildi",
  CANCELLED: "Bekor qilindi",
};

export const getStatusBadge = (status) => {
  const tone = ["DONE", "READY", "DELIVERED"].includes(status)
    ? "green"
    : ["REJECTED", "CANCELLED"].includes(status)
      ? "red"
      : "amber";
  return { label: STATUS_LABELS[status] || status || "—", tone };
};

export const getOrderStatusVariant = (status) => {
  const map = {
    NEW: "new",
    ACCEPTED: "accepted",
    COOKING: "cooking",
    DONE: "done",
    READY: "done",
    DELIVERED: "success",
    DELIVERING: "info",
    REJECTED: "danger",
    CANCELLED: "danger",
  };

  return map[status] || "pending";
};

/* ---------- Order field helpers ---------- */

export const getOrderStatus = (order) =>
  order?.merchantOrderStatus || order?.merchant_order_status || order?.status;

// Merchant order id — used for the /merchant-order/{id}/... endpoints.
export const getMerchantOrderId = (order) => order?.id;

export const getOrderId = (order) => order?.id ?? order?.orderId;

export const getOrderNumber = (order) =>
  order?.orderNumber || `#${order?.orderId ?? order?.id ?? ""}`;

export const getOrderTime = (order) =>
  order?.orderTime || order?.createdAt || order?.statusChangedAt || null;

export const getOrderTimeLabel = (order) => {
  const time = getOrderTime(order);
  if (time) {
    const date = new Date(time);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  }
  return order?.time || "";
};

export const getOrderDateTimeLabel = (order) => {
  const time = getOrderTime(order);
  if (!time) return order?.time || "";
  const date = new Date(time);
  if (Number.isNaN(date.getTime())) return order?.time || "";
  return date.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getOrderCustomerName = (order) =>
  order?.customerName || order?.customer?.name || "Noma'lum mijoz";

export const getOrderPhone = (order) =>
  order?.customerPhoneNumber || order?.customer?.phone || order?.phone || "-";

export const getOrderAvatar = (order) =>
  order?.customer?.avatar || order?.avatar || null;

export const getOrderBranchName = (order) => order?.branch?.name || "-";

export const getOrderBranchPhone = (order) => order?.branch?.phone || "-";

export const getOrderBranchAddress = (order) =>
  order?.branch?.address || order?.address || "-";

export const getOrderItems = (order) =>
  Array.isArray(order?.orderProducts)
    ? order.orderProducts
    : Array.isArray(order?.items)
      ? order.items
      : [];

export const getOrderTotalAmount = (order) => Number(order?.totalAmount || 0);

export const getOrderDiscountedAmount = (order) =>
  Number(order?.discountedAmount || 0);

/* ---------- Product (order item) helpers ---------- */

export const getItemKey = (item, index) =>
  item?.id ?? item?.productId ?? index;

export const getProductName = (item) =>
  item?.productName || item?.name || item?.title || "-";

export const getProductQuantity = (item) =>
  Number(item?.quantity ?? item?.qty ?? 0);

export const getProductUnitPrice = (item) =>
  Number(item?.unitPrice ?? item?.price ?? 0);

export const getProductTotalPrice = (item) => {
  if (item?.totalPrice != null) return Number(item.totalPrice);
  return getProductUnitPrice(item) * getProductQuantity(item);
};

/* ---------- SLA countdown (only for NEW) ---------- */

export const getNewOrderDeadline = (order) => {
  if (getOrderStatus(order) !== "NEW") return null;

  if (order?.confirmationDeadlineAt) {
    const date = new Date(order.confirmationDeadlineAt);
    return Number.isNaN(date.getTime()) ? null : date.getTime();
  }

  const time = getOrderTime(order);
  if (time) {
    const date = new Date(time);
    if (!Number.isNaN(date.getTime())) return date.getTime() + 2 * 60000;
  }

  return null;
};

export const getRemainingMs = (order, now = Date.now()) => {
  const deadline = getNewOrderDeadline(order);
  if (deadline == null) return null;
  return deadline - now;
};

export const isOrderOverdue = (order, now = Date.now()) => {
  const remaining = getRemainingMs(order, now);
  if (remaining == null) return false;
  return remaining < 0;
};

export const formatRemainingTime = (ms) => {
  const totalSeconds = Math.max(0, Math.floor(Math.abs(ms) / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

export const formatSom = (value) =>
  `${Number(value || 0).toLocaleString("ru-RU")} so'm`;

/* ---------- Mock fallback (used only if the API request fails) ---------- */

const NOW = Date.now();
const isoMinsAgo = (m) => new Date(NOW - m * 60000).toISOString();
const isoSecsAgo = (s) => new Date(NOW - s * 1000).toISOString();

export const MOCK_ORDERS = [
  {
    id: 1,
    orderId: 28,
    orderNumber: "#12847",
    orderTime: isoSecsAgo(95),
    merchantOrderStatus: "NEW",
    customerName: "Farrux Mahmudov",
    customerPhoneNumber: "+998 90 123 45 67",
    totalAmount: 94000,
    discountedAmount: 0,
    confirmationDeadlineAt: null,
    branch: {
      id: 1,
      name: "Chilonzor filiali",
      phone: "+998 71 200 00 01",
      address: "Chilonzor 12-kvartal",
    },
    orderProducts: [
      { id: 1, productName: "Lavash Standart", quantity: 2, unitPrice: 32000, totalPrice: 64000 },
      { id: 2, productName: "Coca-Cola", quantity: 1, unitPrice: 12000, totalPrice: 12000 },
      { id: 3, productName: "Achchiq-chuchuk salat", quantity: 1, unitPrice: 18000, totalPrice: 18000 },
    ],
  },
  {
    id: 2,
    orderId: 27,
    orderNumber: "#12845",
    orderTime: isoMinsAgo(6),
    merchantOrderStatus: "ACCEPTED",
    customerName: "Anvar Karimov",
    customerPhoneNumber: "+998 91 234 56 78",
    totalAmount: 134000,
    discountedAmount: 10000,
    branch: {
      id: 3,
      name: "Sergeli filiali",
      phone: "+998 71 200 00 03",
      address: "Sergeli 6-mavze",
    },
    orderProducts: [
      { id: 1, productName: "Burger Classic Special", quantity: 2, unitPrice: 45000, totalPrice: 90000 },
      { id: 2, productName: "Lavash Standart", quantity: 1, unitPrice: 32000, totalPrice: 32000 },
    ],
  },
  {
    id: 3,
    orderId: 25,
    orderNumber: "#12843",
    orderTime: isoMinsAgo(12),
    merchantOrderStatus: "COOKING",
    customerName: "Gulnoza Karimova",
    customerPhoneNumber: "+998 93 555 21 09",
    totalAmount: 57000,
    discountedAmount: 0,
    branch: {
      id: 2,
      name: "Yunusobod filiali",
      phone: "+998 71 200 00 02",
      address: "Yunusobod 19-mavze",
    },
    orderProducts: [
      { id: 1, productName: "Burger Classic Special", quantity: 1, unitPrice: 45000, totalPrice: 45000 },
      { id: 2, productName: "Coca-Cola", quantity: 1, unitPrice: 12000, totalPrice: 12000 },
    ],
  },
  {
    id: 4,
    orderId: 20,
    orderNumber: "#12838",
    orderTime: "2026-06-07T11:24:00",
    merchantOrderStatus: "DONE",
    customerName: "Malika Rahimova",
    customerPhoneNumber: "+998 94 777 88 99",
    totalAmount: 66000,
    discountedAmount: 0,
    branch: {
      id: 1,
      name: "Chilonzor filiali",
      phone: "+998 71 200 00 01",
      address: "Chilonzor 9-kvartal",
    },
    orderProducts: [
      { id: 1, productName: "Doner Kebab Plate", quantity: 1, unitPrice: 54000, totalPrice: 54000 },
      { id: 2, productName: "Coca-Cola", quantity: 1, unitPrice: 12000, totalPrice: 12000 },
    ],
  },
];
