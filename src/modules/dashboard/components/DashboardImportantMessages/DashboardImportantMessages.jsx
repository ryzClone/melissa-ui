import { useTranslation } from "react-i18next";
import { BellRing } from "lucide-react";
import { DASHBOARD_NAMESPACE } from "@/i18n/namespaces";
import { MOCK_IMPORTANT_MESSAGES } from "../../utils/dashboardHomeData";
import "./DashboardImportantMessages.css";

export default function DashboardImportantMessages({
  items = MOCK_IMPORTANT_MESSAGES,
  onDetails,
}) {
  const { t } = useTranslation(DASHBOARD_NAMESPACE);

  return (
    <section className="dashboard-important-messages">
      <header className="dashboard-important-header">
        <span className="dashboard-important-header-icon">
          <BellRing size={18} />
        </span>
        <div>
          <h3>{t("messages.title")}</h3>
          <p>{t("messages.subtitle")}</p>
        </div>
      </header>

      <ul className="dashboard-important-list">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className={`dashboard-important-notice tone-${item.tone || "info"}`}
              onClick={() => onDetails?.(item)}
            >
              <div className="dashboard-important-notice-top">
                <span className="dashboard-important-notice-category">
                  {item.category}
                </span>
                <span className="dashboard-important-notice-date">
                  {item.date}
                </span>
              </div>
              <strong>{item.title}</strong>
              <p>{item.description}</p>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
