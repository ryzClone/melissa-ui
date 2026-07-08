import PageWrapper from "@/components/PageWrapper/PageWrapper";
import "../dashboard.css";

import DashboardWelcome from "../components/DashboardWelcome/DashboardWelcome";
import DashboardAnnouncements from "../components/DashboardAnnouncements/DashboardAnnouncements";
import DashboardImportantMessages from "../components/DashboardImportantMessages/DashboardImportantMessages";
import DashboardTopBranches from "../components/DashboardTopBranches/DashboardTopBranches";

export default function DashboardPage() {
  return (
    <PageWrapper>
      <div className="dashboard-page dashboard-home">
        <DashboardWelcome />

        <DashboardAnnouncements />

        <div className="dashboard-home-bottom-grid">
          <DashboardImportantMessages />
          <DashboardTopBranches />
        </div>
      </div>
    </PageWrapper>
  );
}
