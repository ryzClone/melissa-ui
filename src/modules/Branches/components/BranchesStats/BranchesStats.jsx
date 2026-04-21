import "./BranchesStats.css";
import { TrendingUp, UtensilsCrossed, Users } from "lucide-react";

const stats = [
  {
    title: "OYLIK TUSHUM",
    value: "450,000,000 UZS",
    badge: "+12.5%",
    icon: TrendingUp,
    type: "success",
  },
  {
    title: "ENG FAOL FILIAL",
    value: "Chilonzor",
    badge: "High Load",
    icon: UtensilsCrossed,
    type: "purple",
  },
  {
    title: "XODIMLAR SONI",
    value: "1,240 ta",
    badge: "Active Now",
    icon: Users,
    type: "gray",
  },
];

export default function BranchesStats() {
  return (
    <div className="branches-stats-grid">
      {stats.map((item) => {
        const Icon = item.icon;

        return (
          <div className="branches-stat-card" key={item.title}>
            <div className="branches-stat-top">
              <div className="branches-stat-icon">
                <Icon size={17} />
              </div>

              <div className={`branches-stat-badge ${item.type}`}>
                {item.badge}
              </div>
            </div>

            <div className="branches-stat-label">{item.title}</div>
            <div className="branches-stat-value">{item.value}</div>
          </div>
        );
      })}
    </div>
  );
}