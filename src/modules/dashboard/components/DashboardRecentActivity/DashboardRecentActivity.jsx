import {
  Activity,
  Building2,
  Package,
  ShoppingBasket,
  UserPlus,
} from "lucide-react";
import "../DashboardPanel/DashboardPanel.css";
import "./DashboardRecentActivity.css";

export const MOCK_RECENT_ACTIVITIES = [
  {
    id: 1,
    type: "order",
    text: "Yangi buyurtma yaratildi — ORD-2026-000123",
    time: "5 daqiqa oldin",
  },
  {
    id: 2,
    type: "branch",
    text: "Mirzo Ulugbek filiali ma’lumotlari yangilandi",
    time: "18 daqiqa oldin",
  },
  {
    id: 3,
    type: "product",
    text: "Cheeseburger mahsuloti statusi faol qilindi",
    time: "42 daqiqa oldin",
  },
  {
    id: 4,
    type: "user",
    text: "Yangi foydalanuvchi qo‘shildi — manager01",
    time: "1 soat oldin",
  },
  {
    id: 5,
    type: "order",
    text: "Yangi buyurtma yaratildi — ORD-2026-000118",
    time: "2 soat oldin",
  },
];

const ACTIVITY_ICONS = {
  order: ShoppingBasket,
  branch: Building2,
  product: Package,
  user: UserPlus,
};

export default function DashboardRecentActivity({
  items = MOCK_RECENT_ACTIVITIES,
}) {
  return (
    <section className="dashboard-panel dashboard-recent-activity">
      <header className="dashboard-panel-header">
        <div className="dashboard-panel-title-wrap">
          <span className="dashboard-panel-icon">
            <Activity size={18} />
          </span>
          <div>
            <h3>So‘nggi faolliklar</h3>
            <p>Platformadagi oxirgi o‘zgarishlar va voqealar</p>
          </div>
        </div>
      </header>

      <ul className="dashboard-activity-list">
        {items.map((item) => {
          const Icon = ACTIVITY_ICONS[item.type] || Activity;

          return (
            <li key={item.id} className="dashboard-activity-item">
              <span className={`dashboard-activity-icon type-${item.type}`}>
                <Icon size={16} />
              </span>

              <div className="dashboard-activity-content">
                <p>{item.text}</p>
                <span>{item.time}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
