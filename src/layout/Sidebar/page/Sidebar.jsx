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

const COMING_SOON_BADGE = "Tez orada";

export default function Sidebar() {
  const topMenu = [
    { to: "/", label: "Bosh sahifa", icon: <Home size={18} /> },
    { to: "/branches", label: "Filiallar", icon: <Building2 size={18} /> },
    { to: "/users", label: "Foydalanuvchilar", icon: <Users size={18} /> },
    { to: "/sales", label: "Aksiyalar", icon: <Tag size={18} /> },
    { to: "/catalog", label: "Katalog", icon: <Package size={18} /> },
    { to: "/finance", label: "Moliyaviy", icon: <CreditCard size={18} /> },
    {
      to: "/chat",
      label: "Chat nazorati",
      icon: <MessageSquareText size={18} />,
      badge: COMING_SOON_BADGE,
    },
    { to: "/orders", label: "Order", icon: <ClipboardList size={18} /> },
  ];

  const bottomMenu = [
    {
      to: "/settings",
      label: "Sozlamalar",
      icon: <Settings size={18} />,
      badge: COMING_SOON_BADGE,
    },
  ];

  const renderItem = (item) => (
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
      {item.badge && <span className="sidebar-badge">{item.badge}</span>}
    </NavLink>
  );

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <div className="sidebar-brand">
          <h1>MELISSA</h1>
          <p>MANAGEMENT</p>
        </div>

        <nav className="sidebar-menu">{topMenu.map(renderItem)}</nav>
      </div>

      <div className="sidebar-bottom">{bottomMenu.map(renderItem)}</div>
    </aside>
  );
}
