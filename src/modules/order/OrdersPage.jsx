import "./OrdersPage.css";
import { FiDownload, FiPrinter } from "react-icons/fi";
import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import GlobalTable from "@/components/ui/GlobalTable/GlobalTable";

const ordersData = [
  {
    id: "#12847",
    customer: "Aziz Rahimov",
    status: "DELIVERING",
    payment: "Karta",
    amount: "125,000 so'm",
    address: "Chilonzor 12-kvartal 5-uy",
    time: "14:32",
  },
  {
    id: "#12846",
    customer: "Nilufar Karimova",
    status: "ACCEPTED",
    payment: "Naqd",
    amount: "78,000 so'm",
    address: "Yunusobod 7-mavze, 22-uy",
    time: "14:28",
  },
  {
    id: "#12845",
    customer: "Javohir Tursunov",
    status: "PENDING",
    payment: "Karta",
    amount: "115,500 so'm",
    address: "Sergeli 6-mavze 33-uy",
    time: "14:15",
  },
  {
    id: "#12844",
    customer: "Madina Sherova",
    status: "COMPLETED",
    payment: "Naqd",
    amount: "545,000 so'm",
    address: "Yakkasaroy 5-tor 13-uy",
    time: "13:48",
  },
  {
    id: "#12842",
    customer: "Nargis Obidova",
    status: "CANCELLED",
    payment: "Naqd",
    amount: "214,000 so'm",
    address: "Mirzo Ulug'bek 3-tor 34-uy",
    time: "13:08",
  },
];

const STATUS_MAP = {
  DELIVERING: { label: "Yetkazilmoqda", className: "status-pending" },
  ACCEPTED: { label: "Qabul qilindi", className: "status-active" },
  PENDING: { label: "Kutilmoqda", className: "status-pending" },
  COMPLETED: { label: "Yopildi", className: "status-active" },
  CANCELLED: { label: "Bekor qilindi", className: "status-inactive" },
};

const ITEMS_PER_PAGE = 6;

export default function OrdersPage() {
  const orders = useMemo(
    () => ordersData.map((o, idx) => ({ ...o, rowId: `${o.id}-${idx}` })),
    []
  );

  const [selected, setSelected] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(orders.length / ITEMS_PER_PAGE));

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return orders.slice(start, start + ITEMS_PER_PAGE);
  }, [orders, currentPage]);

  const pageIds = useMemo(
    () => paginatedOrders.map((o) => o.rowId),
    [paginatedOrders]
  );

  const allSelectedOnPage =
    pageIds.length > 0 && pageIds.every((id) => selected.includes(id));

  const someSelectedOnPage =
    pageIds.length > 0 && pageIds.some((id) => selected.includes(id));

  const headerCheckboxRef = useRef(null);

  useEffect(() => {
    if (!headerCheckboxRef.current) return;
    headerCheckboxRef.current.indeterminate =
      !allSelectedOnPage && someSelectedOnPage;
  }, [allSelectedOnPage, someSelectedOnPage]);

  const toggleSelect = useCallback((rowId) => {
    setSelected((prev) =>
      prev.includes(rowId) ? prev.filter((x) => x !== rowId) : [...prev, rowId]
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (allSelectedOnPage) {
      setSelected((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelected((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  }, [allSelectedOnPage, pageIds]);

  const columns = useMemo(
    () => [
      {
        key: "select",
        title: (
          <input
            ref={headerCheckboxRef}
            type="checkbox"
            onChange={toggleSelectAll}
            checked={allSelectedOnPage}
          />
        ),
        width: "48px",
        render: (row) => (
          <input
            type="checkbox"
            checked={selected.includes(row.rowId)}
            onChange={() => toggleSelect(row.rowId)}
          />
        ),
      },
      {
        key: "id",
        title: "#",
        render: (row) => row.id || "—",
      },
      {
        key: "customer",
        title: "Mijoz",
        render: (row) => row.customer || "—",
      },
      {
        key: "status",
        title: "Holat",
        render: (row) => {
          const statusConfig = STATUS_MAP[row.status] || {
            label: row.status,
            className: "status-inactive",
          };
          return (
            <span className={statusConfig.className}>{statusConfig.label}</span>
          );
        },
      },
      {
        key: "payment",
        title: "To‘lov",
        render: (row) => row.payment || "—",
      },
      {
        key: "amount",
        title: "Summa",
        render: (row) => row.amount || "—",
      },
      {
        key: "address",
        title: "Manzil",
        render: (row) => row.address || "—",
      },
      {
        key: "time",
        title: "Vaqt",
        render: (row) => row.time || "—",
      },
    ],
    [allSelectedOnPage, selected, toggleSelect, toggleSelectAll]
  );

  return (
    <div className="orders-page">
      <div className="orders-header">
        <div>
          <h1>Buyurtmalar</h1>
          <p>Barcha buyurtmalarni boshqarish va kuzatish</p>
        </div>

        <div className="orders-actions">
          <button className="btn secondary" type="button">
            <FiPrinter /> Chop etish
          </button>
          <button className="btn primary" type="button">
            <FiDownload /> CVS yuklab olish
          </button>
        </div>
      </div>

      <div className="orders-filters">
        <div className="filter-group">
          <label>Qidiruv</label>
          <input placeholder="Buyurtma # yoki mijoz..." />
        </div>

        <div className="filter-group">
          <label>Holat</label>
          <select>
            <option>Barchasi</option>
            <option value="DELIVERING">Yetkazilmoqda</option>
            <option value="ACCEPTED">Qabul qilindi</option>
            <option value="PENDING">Kutilmoqda</option>
            <option value="COMPLETED">Yopildi</option>
            <option value="CANCELLED">Bekor qilindi</option>
          </select>
        </div>

        <div className="filter-group">
          <label>To‘lov turi</label>
          <select>
            <option>Barchasi</option>
            <option value="Karta">Karta</option>
            <option value="Naqd">Naqd</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Sana oralig‘i</label>
          <input type="date" />
        </div>
      </div>

      <div className="orders-table-wrapper">
        <GlobalTable
          className="orders-global-table"
          columns={columns}
          data={paginatedOrders}
          emptyText="Ma'lumot topilmadi"
          rowKey="rowId"
          pagination={{
            page: currentPage,
            pageSize: ITEMS_PER_PAGE,
            total: orders.length,
          }}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
