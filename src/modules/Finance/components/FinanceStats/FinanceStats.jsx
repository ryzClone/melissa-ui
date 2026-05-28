import { CreditCard, TrendingUp, WalletCards } from "lucide-react";
import "./FinanceStats.css";

const stats = [
  {
    title: "Jami tushumlar (7 kun)",
    value: "62.3M so'm",
    sub: "+12.5% o‘sish",
    icon: TrendingUp,
    variant: "purple",
  },
  {
    title: "Naqd",
    value: "299,500 so'm",
    sub: "3 ta buyurtma",
    icon: WalletCards,
    variant: "orange",
  },
  {
    title: "Karta",
    value: "1.56M so'm",
    sub: "2.5% o‘rtacha",
    icon: CreditCard,
    variant: "gray",
  },
];

export default function FinanceStats() {
  return (
    <div className="finance-stats">
      {stats.map((item) => {
        const Icon = item.icon;

        return (
          <div className="finance-stat-card" key={item.title}>
            <div>
              <span>{item.title}</span>
              <strong>{item.value}</strong>
              <p>{item.sub}</p>
            </div>

            <div className={`finance-stat-icon ${item.variant}`}>
              <Icon size={22} />
            </div>
          </div>
        );
      })}
    </div>
  );
}