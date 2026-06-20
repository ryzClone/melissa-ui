const DEFAULT_BRANCHES = [
  { name: "Markaziy filial", percent: 78 },
  { name: "Chilonzor", percent: 52 },
  { name: "Yunusobod", percent: 94 },
];

const DEFAULT_STATS = [
  {
    title: "JAMI SAVDO",
    value: "45,280,000",
    suffix: "UZS",
    trend: "+12.5%",
    positive: true,
    icon: "wallet",
  },
  {
    title: "BUYURTMALAR SONI",
    value: "1,248",
    suffix: "ta",
    trend: "+8.2%",
    positive: true,
    icon: "orders",
  },
  {
    title: "O‘RTACHA CHEK",
    value: "320,000",
    suffix: "UZS",
    trend: "+5.1%",
    positive: true,
    icon: "receipt",
  },
];

const DEFAULT_RECENT_ORDERS = [
  {
    id: "#12548",
    customer: "Jamshid Karimov",
    date: "24.05.2024",
    status: "Tayyor",
    amount: "1,250,000 UZS",
    initials: "JK",
  },
  {
    id: "#12547",
    customer: "Nodira Mansurova",
    date: "24.05.2024",
    status: "Kutilmoqda",
    amount: "840,000 UZS",
    initials: "NM",
  },
  {
    id: "#12546",
    customer: "Otabek Alimov",
    date: "23.05.2024",
    status: "Bekor qilindi",
    amount: "2,100,000 UZS",
    initials: "OA",
  },
  {
    id: "#12545",
    customer: "Malika Ergasheva",
    date: "23.05.2024",
    status: "Tayyor",
    amount: "970,000 UZS",
    initials: "ME",
  },
  {
    id: "#12544",
    customer: "Sardor Yo‘ldoshev",
    date: "22.05.2024",
    status: "Kutilmoqda",
    amount: "1,430,000 UZS",
    initials: "SY",
  },
];

function formatNumber(value) {
  if (value == null || value === "") return "0";
  const num = Number(value);
  if (!Number.isFinite(num)) return String(value);
  return new Intl.NumberFormat("uz-UZ").format(num);
}

function formatTrend(value) {
  if (value == null || value === "") return "+0%";
  const text = String(value).trim();
  if (text.startsWith("+") || text.startsWith("-")) return text;
  const num = Number(text);
  if (!Number.isFinite(num)) return text;
  return `${num >= 0 ? "+" : ""}${num}%`;
}

function normalizeTrendItem(raw = {}, fallback = {}) {
  const trendValue = raw.trend ?? raw.change ?? raw.percentChange ?? fallback.trend;
  const trendText = formatTrend(trendValue);
  const positive =
    raw.positive ??
    raw.isPositive ??
    (typeof trendValue === "number" ? trendValue >= 0 : !trendText.startsWith("-"));

  return {
    trend: trendText,
    positive: Boolean(positive),
  };
}

function normalizeBranchItem(item = {}) {
  const name =
    item.name ||
    item.branchName ||
    item.title ||
    item.organizationBranchName ||
    "Filial";

  const percent = Number(
    item.percent ?? item.performance ?? item.value ?? item.ratio ?? 0
  );

  return {
    name,
    percent: Number.isFinite(percent) ? Math.max(0, Math.min(100, percent)) : 0,
  };
}

function resolveTopBranch(payload = {}, branches = []) {
  const direct =
    payload.topBranch ||
    payload.bestBranch ||
    payload.topPerformingBranch ||
    payload.data?.topBranch ||
    payload.data?.bestBranch;

  if (direct) {
    return (
      direct.branchName ||
      direct.name ||
      direct.title ||
      direct.organizationBranchName ||
      "Filial"
    );
  }

  if (!branches.length) return "Yunusobod";

  const sorted = [...branches].sort((a, b) => b.percent - a.percent);
  return sorted[0]?.name || "Filial";
}

function normalizeRecentOrders(list = []) {
  if (!Array.isArray(list) || !list.length) return DEFAULT_RECENT_ORDERS;

  return list.map((order, index) => {
    const customer =
      order.customer ||
      order.customerName ||
      order.clientName ||
      "Mijoz";

    const initials = String(customer)
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

    return {
      id: order.id || order.orderNumber || order.number || `#${index + 1}`,
      customer,
      date: order.date || order.createdAt || order.orderDate || "—",
      status: order.status || order.orderStatus || "—",
      amount:
        order.amount ||
        (order.totalAmount != null
          ? `${formatNumber(order.totalAmount)} UZS`
          : "—"),
      initials,
    };
  });
}

export function getDefaultDashboardData() {
  return {
    stats: DEFAULT_STATS,
    branches: DEFAULT_BRANCHES,
    topBranch: resolveTopBranch({}, DEFAULT_BRANCHES),
    recentOrders: DEFAULT_RECENT_ORDERS,
  };
}

export function normalizeDashboardResponse(response) {
  const payload = response?.data ?? response ?? {};
  const data = payload?.data && typeof payload.data === "object" ? payload.data : payload;
  const defaults = getDefaultDashboardData();

  const totalSales = data.totalSales || data.totalRevenue || data.sales || {};
  const orderCount = data.orderCount || data.ordersCount || data.totalOrders || {};
  const averageCheck = data.averageCheck || data.avgCheck || data.averageOrderValue || {};

  const branchesSource =
    data.branchStats ||
    data.branches ||
    data.branchPerformance ||
    data.branchList ||
    defaults.branches;

  const branches = (Array.isArray(branchesSource) ? branchesSource : defaults.branches).map(
    normalizeBranchItem
  );

  const stats = [
    {
      title: "JAMI SAVDO",
      value: formatNumber(totalSales.value ?? totalSales.amount ?? defaults.stats[0].value),
      suffix: totalSales.suffix || totalSales.currency || "UZS",
      icon: "wallet",
      ...normalizeTrendItem(totalSales, defaults.stats[0]),
    },
    {
      title: "BUYURTMALAR SONI",
      value: formatNumber(orderCount.value ?? orderCount.count ?? defaults.stats[1].value),
      suffix: orderCount.suffix || "ta",
      icon: "orders",
      ...normalizeTrendItem(orderCount, defaults.stats[1]),
    },
    {
      title: "O‘RTACHA CHEK",
      value: formatNumber(averageCheck.value ?? averageCheck.amount ?? defaults.stats[2].value),
      suffix: averageCheck.suffix || averageCheck.currency || "UZS",
      icon: "receipt",
      ...normalizeTrendItem(averageCheck, defaults.stats[2]),
    },
  ];

  return {
    stats,
    branches: branches.length ? branches : defaults.branches,
    topBranch: resolveTopBranch(data, branches),
    recentOrders: normalizeRecentOrders(
      data.recentOrders || data.orders || data.latestOrders
    ),
  };
}
