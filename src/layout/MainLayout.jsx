import { Outlet } from "react-router-dom";
import "./layout.css";
import Header from "./Header/pages/Header";
import Sidebar from "./Sidebar/page/Sidebar";

export default function MainLayout() {
  return (
    <div className="layout">
      <div className="layout-body">
        <Sidebar />

        <div className="layout-right">
          <Header />

          <div className="layout-content">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}