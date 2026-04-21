import "./OrdersPage.css";
import { FiDownload, FiPrinter } from "react-icons/fi";
import { useMemo, useState, useEffect, useRef } from "react";

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
  DELIVERING: { label: "Yetkazilmoqda", className: "purple" },
  ACCEPTED: { label: "Qabul qilindi", className: "blue" },
  PENDING: { label: "Kutilmoqda", className: "yellow" },
  COMPLETED: { label: "Yopildi", className: "green" },
  CANCELLED: { label: "Bekor qilindi", className: "gray" },
};

const ITEMS_PER_PAGE = 6;

export default function OrdersPage() {

    
  // id takror bo‘lsa ham ishlashi uchun rowId qo‘shamiz
  const orders = useMemo(
    () => ordersData.map((o, idx) => ({ ...o, rowId: `${o.id}-${idx}` })),
    []
  );

  const [selected, setSelected] = useState([]); // rowId lar saqlanadi
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(orders.length / ITEMS_PER_PAGE));

  // page change bo‘lsa range’dan chiqib ketmasin
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return orders.slice(start, start + ITEMS_PER_PAGE);
  }, [orders, currentPage]);

  // current page idlar
  const pageIds = useMemo(() => paginatedOrders.map((o) => o.rowId), [paginatedOrders]);

  const allSelectedOnPage =
    pageIds.length > 0 && pageIds.every((id) => selected.includes(id));

  const someSelectedOnPage =
    pageIds.length > 0 && pageIds.some((id) => selected.includes(id));

  // indeterminate (yarim tanlangan) ko‘rinishi
  const headerCheckboxRef = useRef(null);
  useEffect(() => {
    if (!headerCheckboxRef.current) return;
    headerCheckboxRef.current.indeterminate = !allSelectedOnPage && someSelectedOnPage;
  }, [allSelectedOnPage, someSelectedOnPage]);

  const toggleSelect = (rowId) => {
    setSelected((prev) =>
      prev.includes(rowId) ? prev.filter((x) => x !== rowId) : [...prev, rowId]
    );
  };

  // SELECT ALL - faqat current page bo‘yicha
  const toggleSelectAll = () => {
    if (allSelectedOnPage) {
      setSelected((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelected((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const goPrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const goNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  return (
    <div className="orders-page">
      {/* HEADER */}
      <div className="orders-header">
        <div>
          <h1>Buyurtmalar</h1>
          <p>Barcha buyurtmalarni boshqarish va kuzatish</p>
        </div>

        <div className="orders-actions">
          <button className="btn secondary">
            <FiPrinter /> Chop etish
          </button>
          <button className="btn primary">
            <FiDownload /> CVS yuklab olish
          </button>
        </div>
      </div>

      {/* FILTERS */}
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

      {/* TABLE */}
      <div className="orders-table-wrapper">
        <table className="orders-table">
          <thead>
            <tr>
              <th>
                <input
                  ref={headerCheckboxRef}
                  type="checkbox"
                  onChange={toggleSelectAll}
                  checked={allSelectedOnPage}
                />
              </th>
              <th>#</th>
              <th>Mijoz</th>
              <th>Holat</th>
              <th>To‘lov</th>
              <th>Summa</th>
              <th>Manzil</th>
              <th>Vaqt</th>
            </tr>
          </thead>

          <tbody>
            {paginatedOrders.map((order) => {
              const statusConfig = STATUS_MAP[order.status] || {
                label: order.status,
                className: "gray",
              };

              return (
                <tr key={order.rowId}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selected.includes(order.rowId)}
                      onChange={() => toggleSelect(order.rowId)}
                    />
                  </td>
                  <td>{order.id}</td>
                  <td>{order.customer}</td>
                  <td>
                    <span className={`badge ${statusConfig.className}`}>
                      {statusConfig.label}
                    </span>
                  </td>
                  <td>{order.payment}</td>
                  <td>{order.amount}</td>
                  <td>{order.address}</td>
                  <td>{order.time}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
<div className="pagination">
  <button
    className="page-btn nav"
    disabled={currentPage === 1}
    onClick={goPrev}
  >
    Oldingi
  </button>

  {Array.from({ length: totalPages }, (_, i) => {
    const page = i + 1;
    return (
      <button
        key={page}
        className={`page-btn ${currentPage === page ? "active" : ""}`}
        onClick={() => setCurrentPage(page)}
      >
        {page}
      </button>
    );
  })}

  <button
    className="page-btn nav"
    disabled={currentPage === totalPages}
    onClick={goNext}
  >
    Keyingi
  </button>
</div>
    </div>
  );
}