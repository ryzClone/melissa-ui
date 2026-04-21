import "../dashboard.css";

import DashboardHeader from "../components/DashboardHeader/DashboardHeader";
import StatsGrid from "../components/StatsGrid/StatsGrid";
import RevenueChart from "../components/RevenueChart/RevenueChart";
import CategoryChart from "../components/CategoryChart/CategoryChart";
import RecentOrders from "../components/RecentOrders/RecentOrders";

export default function DashboardPage() {
  return (
    <div className="dashboard-page">
      <DashboardHeader />
      <StatsGrid />

      <div className="dashboard-main-grid">
        <RevenueChart />
        <CategoryChart />
      </div>

      <RecentOrders />
    </div>
  );
}