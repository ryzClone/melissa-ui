import { Wallet, ShoppingBasket, ReceiptText } from "lucide-react";
import "./StatsGrid.css";

const ICONS = {
  wallet: Wallet,
  orders: ShoppingBasket,
  receipt: ReceiptText,
};

export default function StatsGrid({ stats = [] }) {
  if (!stats.length) return null;

  return (
    <div className="dashboard-stats">
      {stats.map((item) => {
        const Icon = ICONS[item.icon] || Wallet;

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
