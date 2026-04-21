import "./StatCard.css";
import { FiTrendingUp, FiTrendingDown } from "react-icons/fi";

export default function StatCard({
  title,
  value,
  percent,
  positive = true,
  icon: Icon,
}) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span className="stat-title">{title}</span>
        {Icon && (
          <div className="stat-icon">
            <Icon size={18} />
          </div>
        )}
      </div>

      <h2 className="stat-value">{value}</h2>

      <div className={`stat-trend ${positive ? "up" : "down"}`}>
        {positive ? <FiTrendingUp size={14} /> : <FiTrendingDown size={14} />}
        <span>{percent}</span>
      </div>
    </div>
  );
}
