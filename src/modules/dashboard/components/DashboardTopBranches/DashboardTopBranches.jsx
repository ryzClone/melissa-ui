import { useTranslation } from "react-i18next";
import { Crown, MapPin, Trophy } from "lucide-react";
import { DASHBOARD_NAMESPACE } from "@/i18n/namespaces";
import { MOCK_TOP_BRANCHES } from "../../utils/dashboardHomeData";
import "./DashboardTopBranches.css";

export { MOCK_TOP_BRANCHES };

export default function DashboardTopBranches({
  items = MOCK_TOP_BRANCHES,
}) {
  const { t } = useTranslation(DASHBOARD_NAMESPACE);

  return (
    <section className="dashboard-top-branches">
      <header className="dashboard-top-branches-header">
        <span className="dashboard-top-branches-icon">
          <Trophy size={18} />
        </span>
        <div>
          <h3>{t("branches.title")}</h3>
          <p>{t("branches.subtitle")}</p>
        </div>
      </header>

      <ol className="dashboard-top-branches-list">
        {items.map((item) => (
          <li
            key={item.id}
            className={`dashboard-top-branch-item rank-${item.rank}`}
          >
            <span className="dashboard-top-branch-rank">
              {item.rank === 1 ? <Crown size={16} /> : item.rank}
            </span>

            <div className="dashboard-top-branch-info">
              <strong>{item.name}</strong>
              {item.description ? (
                <span className="dashboard-top-branch-address">
                  <MapPin size={12} />
                  {item.description}
                </span>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
