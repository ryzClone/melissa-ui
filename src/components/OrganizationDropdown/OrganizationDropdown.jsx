import { useCallback, useEffect, useMemo, useState } from "react";
import { Building2 } from "lucide-react";
import CustomDropdown from "@/components/CustomDropdown/CustomDropdown";
import { useGlobalNotification } from "@/hooks/useGlobalNotification";
import { organizationBranchApi } from "@/api/modules/organizationBranchApi";

export const normalizeOrganizationList = (res) => {
  const payload = res?.data ?? res;

  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.data?.content)) return payload.data.content;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;

  return [];
};

export default function OrganizationDropdown({
  value,
  onChange,
  includeAllOption = true,
  className = "",
  label = "Tashkilot",
  disabled = false,
}) {
  const { error: notifyError } = useGlobalNotification();
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchOrganizations = useCallback(async () => {
    try {
      setLoading(true);
      const res = await organizationBranchApi.getAll();
      const list = normalizeOrganizationList(res);
      setOrganizations(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error(error);
      notifyError(
        error?.response?.data?.message ||
          error?.message ||
          "Tashkilotlar ro'yxatini yuklashda xatolik"
      );
      setOrganizations([]);
    } finally {
      setLoading(false);
    }
  }, [notifyError]);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  const options = useMemo(() => {
    const mapped = organizations.map((org) => ({
      label: org.name || org.code || `Tashkilot #${org.id}`,
      value: String(org.id),
    }));

    if (includeAllOption) {
      return [{ label: "Barcha tashkilotlar", value: "" }, ...mapped];
    }

    return mapped;
  }, [organizations, includeAllOption]);

  return (
    <CustomDropdown
      className={`organization-dropdown ${className}`.trim()}
      label={label}
      value={value ?? ""}
      options={options}
      onChange={onChange}
      placeholder={loading ? "Yuklanmoqda..." : "Tashkilotni tanlang"}
      disabled={disabled || loading}
      searchable
      clearable={includeAllOption}
      startIcon={<Building2 size={18} strokeWidth={2} />}
    />
  );
}
