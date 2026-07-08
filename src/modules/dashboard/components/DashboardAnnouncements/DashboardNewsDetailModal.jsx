import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import { DASHBOARD_NAMESPACE } from "@/i18n/namespaces";
import "./DashboardNewsDetailModal.css";

export default function DashboardNewsDetailModal({ news, onClose }) {
  const { t } = useTranslation(DASHBOARD_NAMESPACE);

  useEffect(() => {
    if (!news) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [news, onClose]);

  if (!news) return null;

  return (
    <div
      className="dashboard-news-modal-overlay"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="dashboard-news-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dashboard-news-modal-title"
      >
        <button
          type="button"
          className="dashboard-news-modal-close"
          onClick={onClose}
          aria-label={t("modal.close")}
        >
          <X size={18} />
        </button>

        <div className="dashboard-news-modal-image-wrap">
          <img src={news.image} alt="" className="dashboard-news-modal-image" />
          <span
            className={`dashboard-news-modal-badge tone-${news.tone || "info"}`}
          >
            {news.status}
          </span>
        </div>

        <div className="dashboard-news-modal-body">
          <span className="dashboard-news-modal-date">{news.date}</span>
          <h2 id="dashboard-news-modal-title">{news.title}</h2>
          <p>{news.fullDescription}</p>
        </div>
      </div>
    </div>
  );
}
