import {
  BookOpenCheck,
  CircleHelp,
  ClipboardList,
  LayoutGrid,
  Lightbulb,
  UserRound,
} from "lucide-react";
import { MOCK_GUIDE_TIPS } from "../../utils/dashboardHomeData";
import "./DashboardGuideTips.css";

const TIP_ICONS = {
  profile: UserRound,
  catalog: LayoutGrid,
  orders: ClipboardList,
  help: CircleHelp,
};

export default function DashboardGuideTips({ items = MOCK_GUIDE_TIPS }) {
  return (
    <section className="dashboard-guide-tips">
      <header className="dashboard-guide-tips-header">
        <span className="dashboard-guide-tips-icon">
          <Lightbulb size={18} />
        </span>
        <div>
          <h3>Yo‘riqnoma va maslahatlar</h3>
          <p>Tizimdan samarali foydalanish uchun qisqa qo‘llanmalar</p>
        </div>
      </header>

      <div className="dashboard-guide-tips-grid">
        {items.map((item) => {
          const Icon = TIP_ICONS[item.icon] || BookOpenCheck;

          return (
            <article key={item.id} className="dashboard-guide-tip-card">
              <span className="dashboard-guide-tip-icon">
                <Icon size={18} />
              </span>
              <h4>{item.title}</h4>
              <p>{item.description}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
