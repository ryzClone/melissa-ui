import { Wallet, ShoppingBasket, UserPlus, ReceiptText } from "lucide-react";
import "./StatsGrid.css";

const stats = [
  {
    title: "JAMI SAVDO",
    value: "45,280,000",
    suffix: "UZS",
    trend: "+12.5%",
    positive: true,
    icon: Wallet,
  },
  {
    title: "BUYURTMALAR SONI",
    value: "1,248",
    suffix: "ta",
    trend: "+8.2%",
    positive: true,
    icon: ShoppingBasket,
  },
  {
    title: "YANGI MIJOZLAR",
    value: "142",
    suffix: "ta",
    trend: "-2.4%",
    positive: false,
    icon: UserPlus,
  },
  {
    title: "O‘RTACHA CHEK",
    value: "320,000",
    suffix: "UZS",
    trend: "+5.1%",
    positive: true,
    icon: ReceiptText,
  },
];

export default function StatsGrid() {
  return (
    <div className="dashboard-stats">
      {stats.map((item) => {
        const Icon = item.icon;

        return (
          <div className="dashboard-stat-card" key={item.title}>
            <div className="dashboard-stat-top">
              <div className="dashboard-stat-icon">
                <Icon size={18} />
              </div>

              <div
                className={`dashboard-stat-badge ${
                  item.positive ? "positive" : "negative"
                }`}
              >
                {item.trend}
              </div>
            </div>

            <div className="dashboard-stat-label">{item.title}</div>

            <div className="dashboard-stat-value-row">
              <h3>{item.value}</h3>
              <span>{item.suffix}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}