import { Download, Plus } from "lucide-react";
import "./PromotionsHeader.css";

export default function PromotionsHeader({ activeTab, onCreateClick }) {
  const handleCreateClick = () => {
    if (typeof onCreateClick === "function") {
      onCreateClick();
    }
  };

  return (
    <div className="promo-topbar">
      <div className="promo-topbar-left">
        <h1>Aksiyalar</h1>
        <p>Kuponlar va chegirmalarni boshqarish</p>
      </div>

      <div className="promo-topbar-actions">
        {activeTab === "Aksiyalar" && (
          <button type="button" className="promo-outline-btn">
            <Download size={16} />
            <span>Yuklab olish</span>
          </button>
        )}

        <button
          type="button"
          className="promo-primary-btn"
          onClick={handleCreateClick}
        >
          <Plus size={16} />
          <span>
            {activeTab === "Aksiyalar" ? "Yangi aksiya" : "Yangi promokod"}
          </span>
        </button>
      </div>
    </div>
  );
}