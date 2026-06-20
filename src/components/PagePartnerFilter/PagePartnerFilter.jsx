import { useAuth } from "@/core/hooks/useAuth";
import PartnerSelector from "@/components/PartnerSelector/PartnerSelector";

/** Visible only when JWT payload.sub === "admin". Uses PartnerContext list (no extra fetch). */
export default function PagePartnerFilter({ partnerLabel = "Partner" }) {
  const { isSuperAdmin } = useAuth();

  if (!isSuperAdmin) {
    return null;
  }

  return <PartnerSelector label={partnerLabel} />;
}
