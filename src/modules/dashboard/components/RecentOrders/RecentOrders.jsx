import { useMemo, useState } from "react";
import GlobalTable from "@/components/GlobalTable/GlobalTable";
import StatusBadge, { inferStatusVariant } from "@/components/StatusBadge/StatusBadge";
import "./RecentOrders.css";

function getStatusVariant(status) {  if (status === "Tayyor") return "done";
  if (status === "Kutilmoqda") return "warning";
  if (status === "Bekor qilindi") return "inactive";
  return inferStatusVariant(status);
}

export default function RecentOrders({ orders = [], loading = false }) {
  const [showAll, setShowAll] = useState(false);

  const visibleOrders = useMemo(() => {
    return showAll ? orders : orders.slice(0, 5);
  }, [orders, showAll]);
  const columns = useMemo(
    () => [
      {
        key: "id",
        title: "ID",
        className: "order-id",
        render: (row) => row.id || "—",
      },
      {
        key: "customer",
        title: "MIJOZ",
        render: (row) => (
          <div className="customer-cell">
            <div className="customer-avatar">{row.initials || "—"}</div>
            <span>{row.customer || "—"}</span>
          </div>
        ),
      },
      {
        key: "date",
        title: "SANA",
        render: (row) => row.date || "—",
      },
      {
        key: "status",
        title: "HOLAT",
        render: (row) => (
          <StatusBadge
            variant={getStatusVariant(row.status)}
            label={row.status || "—"}
          />
        ),
      },
      {
        key: "amount",
        title: "SUMMA",
        className: "order-amount",
        render: (row) => row.amount || "—",
      },
    ],
    []
  );

  return (
    <div className="recent-orders-card">
      <div className="recent-orders-header">
        <div>
          <h3>So‘nggi buyurtmalar</h3>
          <p>Real vaqt rejimidagi o‘zgarishlar</p>
        </div>

        {orders.length > 5 && (
          <button
            type="button"
            className="recent-orders-toggle-btn"
            onClick={() => setShowAll((prev) => !prev)}
          >
            {showAll ? "Yopish" : "Barchasini ko‘rish"}
          </button>
        )}
      </div>

      <div className="recent-orders-table-wrap">
        <GlobalTable
          className="global-table--flat recent-orders-global-table"
          columns={columns}
          data={visibleOrders}
          loading={loading}
          emptyText="Ma'lumot topilmadi"
          rowKey="id"
        />      </div>
    </div>
  );
}
