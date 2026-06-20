import "./CategoryChart.css";
import { useAuth } from "@/core/hooks/useAuth";
import TopFilialSelector, {
  TopFilialStaticCard,
} from "../TopFilialSelector/TopFilialSelector";

const DEFAULT_BRANCHES = [
  { name: "Markaziy filial", percent: 78 },
  { name: "Chilonzor", percent: 52 },
  { name: "Yunusobod", percent: 94 },
];

export default function CategoryChart({
  branches = DEFAULT_BRANCHES,
  topBranch = "Yunusobod",
}) {
  const { isSuperAdmin } = useAuth();
  const branchList = branches.length ? branches : DEFAULT_BRANCHES;

  return (
    <div className="branch-card">
      <div className="branch-header">
        <h3>Filiallar ko‘rsatkichi</h3>
      </div>

      <div className="branch-list">
        {branchList.map((item) => (
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

      <div className="branch-top-block">
        {isSuperAdmin ? (
          <TopFilialSelector />
        ) : (
          <TopFilialStaticCard value={topBranch} />
        )}
      </div>
    </div>
  );
}
