import PageWrapper from "@/components/PageWrapper/PageWrapper";
import "../FinancePage.css";
import FinanceHeader from "../components/FinanceHeader/FinanceHeader";
import FinanceStats from "../components/FinanceStats/FinanceStats";
import FinanceOrdersTable from "../components/FinanceOrdersTable/FinanceOrdersTable";

export default function FinancePage() {
  return (
    <PageWrapper>
      <div className="finance-page">
        <FinanceHeader />
        <FinanceStats />
        <FinanceOrdersTable />
      </div>
    </PageWrapper>
  );
}