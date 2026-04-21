import "../branches.css";
import BranchesHeader from "../components/BranchesHeader/BranchesHeader";
import BranchesTable from "../components/BranchesTable/BranchesTable";
import BranchesStats from "../components/BranchesStats/BranchesStats";

export default function BranchesPage() {
  return (
    <div className="branches-page">
      <BranchesHeader />
      <BranchesTable />
      <BranchesStats />
    </div>
  );
}