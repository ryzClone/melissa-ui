import { useCallback, useEffect, useState } from "react";
import { api } from "@/api";

import "../branches.css";
import BranchesHeader from "../components/BranchesHeader/BranchesHeader";
import BranchesTable from "@/modules/Branches/components/BranchesTable/BranchesTable";

export default function BranchesPage() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchBranches = useCallback(async () => {
    try {
      setLoading(true);

      const res = await api.organizationBranch.getAllBranches();

      const list = Array.isArray(res?.data) ? res.data : [];

      setBranches(list);
    } catch (error) {
      console.error(error?.message || "Filiallarni yuklashda xatolik");
      setBranches([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  return (
    <div className="branches-page">
      <BranchesHeader onRefresh={fetchBranches} />

      <BranchesTable
        data={branches}
        loading={loading}
        onRefresh={fetchBranches}
      />
    </div>
  );
}
