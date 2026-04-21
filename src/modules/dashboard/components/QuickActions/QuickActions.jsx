import "./QuickActions.css";
import { FiPlus, FiTag, FiDownload } from "react-icons/fi";

export default function QuickActions({ actions }) {
  // keyinchalik API dan keladi
  const mockActions = [
    {
      label: "Yangi mahsulot",
      type: "primary",
      icon: FiPlus,
      onClick: () => console.log("Yangi mahsulot"),
    },
    {
      label: "Kupon yaratish",
      type: "secondary",
      icon: FiTag,
      onClick: () => console.log("Kupon yaratish"),
    },
    {
      label: "Hisobni yuklab olish",
      type: "secondary",
      icon: FiDownload,
      onClick: () => console.log("Hisobni yuklab olish"),
    },
  ];

  const data = actions || mockActions;

  return (
    <div className="dashboard-quick-card">
      <h3 className="dashboard-quick-title">Tez harakatlar</h3>

      <div className="dashboard-quick-list">
        {data.map((item, index) => {
          const Icon = item.icon;

          return (
            <button
              key={index}
              onClick={item.onClick}
              className={`dashboard-quick-btn ${
                item.type === "primary"
                  ? "dashboard-quick-btn-primary"
                  : "dashboard-quick-btn-secondary"
              }`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}