import { useCallback, useEffect, useState } from "react";
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { api } from "@/api";
import PageWrapper from "@/components/PageWrapper/PageWrapper";
import FilterBar, { FilterItem } from "@/components/FilterBar/FilterBar";
import PagePartnerFilter from "@/components/PagePartnerFilter/PagePartnerFilter";
import { useScopedPartnerParams } from "@/hooks/useScopedPartnerParams";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useLatestRequest } from "@/hooks/useLatestRequest";
import { useAuth } from "@/core/hooks/useAuth";
import { BRANCHES_NAMESPACE } from "@/i18n/namespaces";
import "../branches.css";
import BranchesHeader from "../components/BranchesHeader/BranchesHeader";
import BranchesTable from "@/modules/Branches/components/BranchesTable/BranchesTable";

function normalizeBranchList(response) {
  const payload = response?.data ?? response;

  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.data?.content)) return payload.data.content;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;

  return [];
}

export default function BranchesPage() {
  const { t } = useTranslation(BRANCHES_NAMESPACE);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 3000);
  const { isSuperAdmin } = useAuth();
  const { canFetch, getOrganizationBranchParams } = useScopedPartnerParams();
  const { beginRequest, isLatestRequest } = useLatestRequest();

  const fetchBranches = useCallback(async () => {
    if (!canFetch) {
      setBranches([]);
      return;
    }

    const requestId = beginRequest();

    try {
      setLoading(true);
      const res = await api.organizationBranch.getAll(
        getOrganizationBranchParams({
          search: debouncedSearch.trim() || undefined,
        })
      );

      if (!isLatestRequest(requestId)) return;

      setBranches(normalizeBranchList(res));
    } catch (error) {
      if (!isLatestRequest(requestId)) return;
      console.error(error?.message || "Filiallarni yuklashda xatolik");
      setBranches([]);
    } finally {
      if (isLatestRequest(requestId)) {
        setLoading(false);
      }
    }
  }, [
    canFetch,
    getOrganizationBranchParams,
    debouncedSearch,
    beginRequest,
    isLatestRequest,
  ]);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  return (
    <PageWrapper>
      <div className="branches-page">
        <BranchesHeader onRefresh={fetchBranches} />

        <FilterBar>
          {isSuperAdmin && (
            <FilterItem>
              <PagePartnerFilter />
            </FilterItem>
          )}

          <FilterItem grow>
            <div className="branches-search-box">
              <Search size={16} />
              <input
                type="text"
                placeholder={t("search.placeholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </FilterItem>
        </FilterBar>

        <BranchesTable
          data={branches}
          loading={loading}
          onRefresh={fetchBranches}
          emptyText={canFetch ? t("states.noData") : t("states.partnerSelect")}
        />
      </div>
    </PageWrapper>
  );
}
