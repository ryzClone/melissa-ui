import { useMemo } from "react";
import { Building2 } from "lucide-react";
import CustomDropdown from "@/components/CustomDropdown/CustomDropdown";
import { usePartner } from "@/context/PartnerContext";
import "./PartnerSelector.css";

function getPartnerId(partner = {}) {
  return partner.organizationId ?? partner.partnerId ?? partner.id;
}

function getPartnerLabel(partner = {}) {
  const id = getPartnerId(partner);

  return (
    partner.organizationName ||
    partner.name ||
    partner.partnerName ||
    partner.merchantName ||
    partner.code ||
    (id != null ? `Partner #${id}` : "Partner")
  );
}

export default function PartnerSelector({
  className = "",
  label = "Partner",
  placeholder,
  disabled = false,
}) {
  const { partners, partnersLoading, partnerId, setPartnerId } = usePartner();

  const options = useMemo(
    () =>
      partners
        .map((partner) => {
          const id = getPartnerId(partner);
          if (id == null) return null;

          return {
            label: getPartnerLabel(partner),
            value: String(id),
          };
        })
        .filter(Boolean),
    [partners]
  );

  const resolvedPlaceholder =
    placeholder ??
    (partnersLoading
      ? "Yuklanmoqda..."
      : options.length
        ? "Partnerni tanlang"
        : "Partnerlar topilmadi");

  return (
    <CustomDropdown
      className={`partner-selector ${className}`.trim()}
      label={label}
      value={partnerId}
      options={options}
      onChange={setPartnerId}
      placeholder={resolvedPlaceholder}
      disabled={disabled || partnersLoading}
      searchable
      clearable={false}
      startIcon={<Building2 size={18} strokeWidth={2} />}
      menuPortal
    />
  );
}
