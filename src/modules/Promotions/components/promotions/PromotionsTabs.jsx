import "./PromotionsTabs.css";

export default function PromotionsTabs({ tabs, activeTab, onChange }) {
  return (
    <div className="promo-tabs">
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          className={`promo-tab ${activeTab === tab ? "active" : ""}`}
          onClick={() => onChange(tab)}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}