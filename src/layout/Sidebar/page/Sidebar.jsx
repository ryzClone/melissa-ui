import { useCallback, useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
  Shield,
  ChevronDown,
} from "lucide-react";
import { SIDEBAR_NAMESPACE } from "@/i18n/namespaces";
import { ADMIN_MENU_ITEMS, isAdminRoute } from "../config/adminMenu";
import "../sidebar.css";

export default function Sidebar() {
  const { t } = useTranslation(SIDEBAR_NAMESPACE);
  const location = useLocation();
  const [adminOpen, setAdminOpen] = useState(false);

  const onAdminRoute = isAdminRoute(location.pathname);

  useEffect(() => {
    setAdminOpen(onAdminRoute);
  }, [onAdminRoute]);

  const closeAdminMenu = useCallback(() => {
    setAdminOpen(false);
  }, []);

  const toggleAdminMenu = useCallback(() => {
    setAdminOpen((value) => !value);
  }, []);

  const openAdminMenu = useCallback(() => {
    setAdminOpen(true);
  }, []);

  const topMenu = [
    { to: "/", labelKey: "dashboard", icon: <Home size={18} /> },
    { to: "/branches", labelKey: "branches", icon: <Building2 size={18} /> },
    { to: "/users", labelKey: "users", icon: <Users size={18} /> },
    { to: "/sales", labelKey: "promotions", icon: <Tag size={18} /> },
    { to: "/catalog", labelKey: "catalog", icon: <Package size={18} /> },
    { to: "/finance", labelKey: "finance", icon: <CreditCard size={18} /> },
    {
      to: "/chat",
      labelKey: "chatMonitoring",
      icon: <MessageSquareText size={18} />,
      badgeKey: "comingSoon",
    },
    { to: "/orders", labelKey: "orders", icon: <ClipboardList size={18} /> },
  ];

  const bottomMenu = [
    {
      to: "/settings",
      labelKey: "settings",
      icon: <Settings size={18} />,
      badgeKey: "comingSoon",
    },
  ];

  const renderItem = (item) => (
    <NavLink
      key={item.to}
      to={item.to}
      end={item.to === "/"}
      onClick={closeAdminMenu}
      className={({ isActive }) =>
        isActive ? "sidebar-item active" : "sidebar-item"
      }
    >
      <span className="sidebar-icon">{item.icon}</span>
      <span className="sidebar-label">{t(item.labelKey)}</span>
      {item.badgeKey && (
        <span className="sidebar-badge">{t(item.badgeKey)}</span>
      )}
    </NavLink>
  );

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <div className="sidebar-brand">
          <h1>MELISSA</h1>
          <p>MANAGEMENT</p>
        </div>

        <nav className="sidebar-menu">
          {topMenu.map(renderItem)}

          <div
            className={`sidebar-accordion ${adminOpen ? "open" : ""} ${
              onAdminRoute ? "active-group" : ""
            }`}
          >
            <button
              type="button"
              className={`sidebar-accordion-trigger ${
                onAdminRoute ? "active" : ""
              }`}
              onClick={toggleAdminMenu}
              aria-expanded={adminOpen}
            >
              <span className="sidebar-icon">
                <Shield size={18} />
              </span>
              <span className="sidebar-label">{t("admin")}</span>
              <ChevronDown size={16} className="sidebar-accordion-chevron" />
            </button>

            <div className="sidebar-accordion-panel">
              <div className="sidebar-accordion-panel-inner">
                {ADMIN_MENU_ITEMS.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={openAdminMenu}
                    className={({ isActive }) =>
                      isActive ? "sidebar-subitem active" : "sidebar-subitem"
                    }
                  >
                    {t(item.labelKey)}
                  </NavLink>
                ))}
              </div>
            </div>
          </div>
        </nav>
      </div>

      <div className="sidebar-bottom">{bottomMenu.map(renderItem)}</div>
    </aside>
  );
}
