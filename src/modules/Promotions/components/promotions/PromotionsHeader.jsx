import { Download, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PROMOTIONS_NAMESPACE } from "@/i18n/namespaces";
import { PROMO_TAB_PROMOTIONS } from "../../constants/promoTabs";
import "./PromotionsHeader.css";

export default function PromotionsHeader({ activeTab, onCreateClick, readOnly = false }) {
  const { t } = useTranslation(PROMOTIONS_NAMESPACE);

  const handleCreateClick = () => {
    if (typeof onCreateClick === "function") {
      onCreateClick();
    }
  };

  return (
    <div className="promo-topbar">
      <div className="promo-topbar-left">
        <h1>{t("title")}</h1>
        <p>{t("subtitle")}</p>
      </div>

      <div className="promo-topbar-actions">
        {activeTab === PROMO_TAB_PROMOTIONS && (
          <button type="button" className="promo-outline-btn">
            <Download size={16} />
            <span>{t("buttons.download")}</span>
          </button>
        )}

        {!readOnly && (
          <button
            type="button"
            className="promo-primary-btn"
            onClick={handleCreateClick}
          >
            <Plus size={16} />
            <span>
              {activeTab === PROMO_TAB_PROMOTIONS
                ? t("buttons.add")
                : t("buttons.addPromoCode")}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
