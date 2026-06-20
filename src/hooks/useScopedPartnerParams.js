import { useCallback } from "react";
import { useAuth } from "@/core/hooks/useAuth";
import { usePartner } from "@/context/PartnerContext";
import { PARTNER_SELECT_MESSAGE } from "@/constants/partnerScope";
import { buildListParams } from "@/utils/buildListParams";

export { PARTNER_SELECT_MESSAGE };

export function useScopedPartnerParams() {
  const { isSuperAdmin } = useAuth();
  const { partnerId, hasPartnerSelected } = usePartner();

  const canFetch = !isSuperAdmin || hasPartnerSelected;

  const getParams = useCallback(
    (extra = {}) => {
      const params = buildListParams(extra);

      if (isSuperAdmin && hasPartnerSelected && partnerId) {
        const id = Number(partnerId);
        if (Number.isFinite(id)) {
          params.partnerId = id;
        }
      }

      return params;
    },
    [isSuperAdmin, hasPartnerSelected, partnerId]
  );

  /** Super Admin scoped APIs: organizationId from selected organization */
  const getOrganizationParams = useCallback(
    (extra = {}) => {
      const params = buildListParams(extra);

      if (isSuperAdmin && hasPartnerSelected && partnerId) {
        const organizationId = Number(partnerId);
        if (Number.isFinite(organizationId)) {
          params.organizationId = organizationId;
        }
      }

      return params;
    },
    [isSuperAdmin, hasPartnerSelected, partnerId]
  );

  /** @deprecated alias — use getOrganizationParams */
  const getOrganizationBranchParams = getOrganizationParams;

  return {
    isSuperAdmin,
    partnerId,
    hasPartnerSelected,
    canFetch,
    getParams,
    getOrganizationParams,
    getOrganizationBranchParams,
  };
}
