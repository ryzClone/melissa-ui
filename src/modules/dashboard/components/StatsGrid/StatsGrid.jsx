import {
  Building2,
  Package,
  ShoppingBasket,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import "./StatsGrid.css";

const ICONS = {
  orders: ShoppingBasket,
  branches: Building2,
  products: Package,
  revenue: Wallet,
  wallet: Wallet,
  receipt: Wallet,
};

export default function StatsGrid({ stats = [] }) {
  if (!stats.length) return null;

  return (
    <div className="dashboard-stats">
      {stats.map((item) => {
        const Icon = ICONS[item.icon] || Wallet;
        const TrendIcon = item.positive ? TrendingUp : TrendingDown;

        return (
          <article className="dashboard-stat-card" key={item.title}>
            <div className="dashboard-stat-top">
              <div className="dashboard-stat-icon">
                <Icon size={18} />
              </div>

              <div
                className={`dashboard-stat-badge ${
                  item.positive ? "positive" : "negative"
                }`}
              >
                <TrendIcon size={13} />
                <span>{item.trend}</span>
              </div>
            </div>

            <div className="dashboard-stat-label">{item.title}</div>

            <div className="dashboard-stat-value-row">
              <h3>{item.value}</h3>
              {item.suffix ? <span>{item.suffix}</span> : null}
            </div>

            {item.description ? (
              <p className="dashboard-stat-description">{item.description}</p>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
