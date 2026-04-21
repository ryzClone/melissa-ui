import { NavLink } from "react-router-dom";
import {
  Home,
  Building2,
  Users,
  Tag,
  Package,
  CreditCard,
  MessageSquareText,
  ClipboardList,
  Settings,
} from "lucide-react";
import "../sidebar.css";

export default function Sidebar() {
  const topMenu = [
    { to: "/", label: "Bosh sahifa", icon: <Home size={18} /> },
    { to: "/branches", label: "Filiallar", icon: <Building2 size={18} /> },
    { to: "/users", label: "Foydalanuvchilar", icon: <Users size={18} /> },
    { to: "/sales", label: "Aksiyalar", icon: <Tag size={18} /> },
    { to: "/catalog", label: "Katalog", icon: <Package size={18} /> },
    { to: "/finance", label: "Moliyaviy", icon: <CreditCard size={18} /> },
    { to: "/chat", label: "Chat nazorati", icon: <MessageSquareText size={18} /> },
    { to: "/orders", label: "Order", icon: <ClipboardList size={18} /> },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <div className="sidebar-brand">
          <h1>MELISSA</h1>
          <p>MANAGEMENT</p>
        </div>

        <nav className="sidebar-menu">
          {topMenu.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                isActive ? "sidebar-item active" : "sidebar-item"
              }
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="sidebar-bottom">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            isActive ? "sidebar-item active" : "sidebar-item"
          }
        >
          <span className="sidebar-icon">
            <Settings size={18} />
          </span>
          <span className="sidebar-label">Sozlamalar</span>
        </NavLink>
      </div>
    </aside>
  );
}