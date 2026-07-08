import { useTranslation } from "react-i18next";
import { PROMOTIONS_NAMESPACE } from "@/i18n/namespaces";
import "./PromotionsTabs.css";

const TAB_LABEL_KEYS = {
  promotions: "tabs.promotions",
  promoCodes: "tabs.promoCodes",
};

export default function PromotionsTabs({ tabs, activeTab, onChange }) {
  const { t } = useTranslation(PROMOTIONS_NAMESPACE);

  return (
    <div className="promo-tabs">
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          className={`promo-tab ${activeTab === tab ? "active" : ""}`}
          onClick={() => onChange(tab)}
        >
          {t(TAB_LABEL_KEYS[tab] || tab)}
        </button>
      ))}
    </div>
  );
}
