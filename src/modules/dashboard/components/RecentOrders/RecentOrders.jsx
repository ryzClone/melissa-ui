import { useMemo, useState } from "react";
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
  if (status === "Tayyor") return "ready";
  if (status === "Kutilmoqda") return "waiting";
  if (status === "Bekor qilindi") return "cancelled";
  return "";
}

export default function RecentOrders() {
  const [showAll, setShowAll] = useState(false);

  const visibleOrders = useMemo(() => {
    return showAll ? orders : orders.slice(0, 5);
  }, [showAll]);

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
        <table className="recent-orders-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>MIJOZ</th>
              <th>SANA</th>
              <th>HOLAT</th>
              <th>SUMMA</th>
            </tr>
          </thead>

          <tbody>
            {visibleOrders.map((item) => (
              <tr key={item.id}>
                <td className="order-id">{item.id}</td>
                <td>
                  <div className="customer-cell">
                    <div className="customer-avatar">{item.initials}</div>
                    <span>{item.customer}</span>
                  </div>
                </td>
                <td>{item.date}</td>
                <td>
                  <span className={`order-status ${getStatusClass(item.status)}`}>
                    {item.status}
                  </span>
                </td>
                <td className="order-amount">{item.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}