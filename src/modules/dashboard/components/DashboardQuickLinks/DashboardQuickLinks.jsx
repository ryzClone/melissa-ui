import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  CircleHelp,
  ClipboardList,
  LayoutGrid,
  UserRound,
  Zap,
} from "lucide-react";
import { useProfile } from "@/context/ProfileContext";
import { MOCK_QUICK_LINKS } from "../../utils/dashboardHomeData";
import "./DashboardQuickLinks.css";

const LINK_ICONS = {
  profile: UserRound,
  help: CircleHelp,
  catalog: LayoutGrid,
  orders: ClipboardList,
  guide: BookOpen,
};

export default function DashboardQuickLinks({ items = MOCK_QUICK_LINKS }) {
  const navigate = useNavigate();
  const { openProfileModal } = useProfile();

  const handleClick = (item) => {
    if (item.action === "openProfile") {
      openProfileModal();
      return;
    }

    if (item.to) {
      navigate(item.to);
    }
  };

  return (
    <section className="dashboard-quick-links">
      <header className="dashboard-quick-links-header">
        <span className="dashboard-quick-links-icon">
          <Zap size={18} />
        </span>
        <div>
          <h3>Tezkor havolalar</h3>
          <p>Kundalik ish uchun foydali bo‘limlarga tez o‘ting</p>
        </div>
      </header>

      <div className="dashboard-quick-links-grid">
        {items.map((item) => {
          const Icon = LINK_ICONS[item.icon] || CircleHelp;

          return (
            <button
              key={item.id}
              type="button"
              className="dashboard-quick-link-card"
              onClick={() => handleClick(item)}
            >
              <span className="dashboard-quick-link-icon">
                <Icon size={18} />
              </span>
              <div className="dashboard-quick-link-text">
                <strong>{item.label}</strong>
                <span>{item.description}</span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
