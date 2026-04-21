import "./CategoryChart.css";
import { Star } from "lucide-react";

const branches = [
  { name: "Markaziy filial", percent: 78 },
  { name: "Chilonzor", percent: 52 },
  { name: "Yunusobod", percent: 94 },
];

export default function CategoryChart() {
  return (
    <div className="branch-card">
      <div className="branch-header">
        <h3>Filiallar ko‘rsatkichi</h3>
      </div>

      <div className="branch-list">
        {branches.map((item) => (
          <div className="branch-item" key={item.name}>
            <div className="branch-row">
              <span>{item.name}</span>
              <strong>{item.percent}%</strong>
            </div>

            <div className="branch-progress">
              <div
                className="branch-progress-fill"
                style={{ width: `${item.percent}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="branch-top-seller">
        <div className="branch-top-icon">
          <Star size={16} />
        </div>

        <div>
          <p>TOP SOTUVCHI</p>
          <h4>Anvar G‘aniyev</h4>
        </div>
      </div>
    </div>
  );
}