import { useMemo, useState } from "react";
import GlobalTable from "@/components/ui/GlobalTable/GlobalTable";
import "./RecentOrders.css";

const orders = [
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
  {
    id: "#12543",
    customer: "Dilshod Tursunov",
    date: "22.05.2024",
    status: "Bekor qilindi",
    amount: "560,000 UZS",
    initials: "DT",
  },
  {
    id: "#12542",
    customer: "Nargiza Qodirova",
    date: "21.05.2024",
    status: "Tayyor",
    amount: "2,340,000 UZS",
    initials: "NQ",
  },
];

function getStatusClass(status) {
  if (status === "Tayyor") return "status-active";
  if (status === "Kutilmoqda") return "status-pending";
  if (status === "Bekor qilindi") return "status-inactive";
  return "status-pending";
}

export default function RecentOrders() {
  const [showAll, setShowAll] = useState(false);

  const visibleOrders = useMemo(() => {
    return showAll ? orders : orders.slice(0, 5);
  }, [showAll]);

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
          <span className={getStatusClass(row.status)}>{row.status || "—"}</span>
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
          className="recent-orders-global-table"
          columns={columns}
          data={visibleOrders}
          emptyText="Ma'lumot topilmadi"
          rowKey="id"
        />
      </div>
    </div>
  );
}
