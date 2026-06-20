import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/core/hooks/useAuth";
import { usePartner } from "@/context/PartnerContext";
import { organizationBranchApi } from "@/api/modules/organizationBranchApi";
import { normalizeOrganizationList } from "@/components/OrganizationDropdown/OrganizationDropdown";

/**
 * Super Admin only: load branches for the selected organization via
 * GET /catalog/api/v1/organization-branch?organizationId={selectedOrganizationId}
 */
export function useSuperAdminOrganizationBranches() {
  const { isSuperAdmin } = useAuth();
  const { partnerId, hasPartnerSelected } = usePartner();
  const [branches, setBranches] = useState([]);
  const [branchesLoading, setBranchesLoading] = useState(false);

  const fetchBranches = useCallback(async () => {
    if (!isSuperAdmin || !hasPartnerSelected || !partnerId) {
      setBranches([]);
      return;
    }

    const organizationId = Number(partnerId);
    if (!Number.isFinite(organizationId)) {
      setBranches([]);
      return;
    }

    try {
      setBranchesLoading(true);
      const response = await organizationBranchApi.getByOrganizationId(
        organizationId
      );
      const list = normalizeOrganizationList(response);
      setBranches(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("Organization branches fetch error:", error);
      setBranches([]);
    } finally {
      setBranchesLoading(false);
    }
  }, [isSuperAdmin, hasPartnerSelected, partnerId]);

  useEffect(() => {
    if (!isSuperAdmin) {
      setBranches([]);
      return;
    }

    fetchBranches();
  }, [isSuperAdmin, fetchBranches]);

  return {
    branches,
    branchesLoading,
    refetchBranches: fetchBranches,
  };
}
