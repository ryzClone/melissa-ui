import { useMemo } from "react";
import { ArrowLeft, Shield } from "lucide-react";
import GlobalTable from "@/components/GlobalTable/GlobalTable";

export function permissionName(permission) {
  return (
    permission?.name ||
    permission?.permissionName ||
    permission?.code ||
    permission?.title ||
    permission?.key ||
    "-"
  );
}

export function permissionCode(permission) {
  return permission?.code || permission?.key || "-";
}

export function permissionModule(permission) {
  return permission?.module || permission?.moduleName || "-";
}

export function permissionDescription(permission) {
  return permission?.description || permission?.permissionDescription || "-";
}

export function roleDisplayName(role) {
  return (
    role?.roleName || role?.name || role?.title || `Rol #${role?.id ?? ""}`
  );
}

export default function RolePermissionsDetail({
  role,
  permissions = [],
  totalPermissions = permissions.length,
  loading = false,
  searchValue = "",
  onSearchChange,
  onBack,
}) {
  const columns = useMemo(
    () => [
      { key: "id", label: "ID", render: (row) => row?.id ?? "-" },
      {
        key: "name",
        label: "Permission nomi",
        render: (row) => permissionName(row),
      },
      {
        key: "code",
        label: "Code",
        render: (row) => (
          <span className="permission-code-badge">{permissionCode(row)}</span>
        ),
      },
      {
        key: "module",
        label: "Module",
        render: (row) => permissionModule(row),
      },
      {
        key: "description",
        label: "Description",
        render: (row) => permissionDescription(row),
      },
    ],
    []
  );

  return (
    <div className="role-detail-card">
      <div className="role-detail-header">
        <button
          type="button"
          className="role-detail-back-btn"
          onClick={onBack}
        >
          <ArrowLeft size={16} />
          <span>Ortga qaytish</span>
        </button>

        <div className="role-detail-title">
          <Shield size={18} />
          <div>
            <h3>{roleDisplayName(role)}</h3>
            {role?.description && <p>{role.description}</p>}
          </div>
        </div>
      </div>

      <div className="role-detail-body">
        <GlobalTable
          title="Ruxsatlar"
          columns={columns}
          data={permissions}
          loading={loading}
          emptyText={
            totalPermissions === 0
              ? "Bu rolga hech qanday ruxsat biriktirilmagan"
              : "Qidiruv bo'yicha hech narsa topilmadi"
          }
          rowKey={(row, index) => row?.id ?? `permission-${index}`}
          searchValue={searchValue}
          onSearchChange={onSearchChange}
          searchPlaceholder="Ruxsatlar ichidan qidirish..."
        />
      </div>
    </div>
  );
}
