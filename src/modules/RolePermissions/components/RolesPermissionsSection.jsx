import { useCallback, useEffect, useMemo, useState } from "react";
import { Eye } from "lucide-react";
import { api } from "@/api";
import GlobalTable from "@/components/GlobalTable/GlobalTable";

import RolePermissionsDetail, {
  permissionCode,
  permissionDescription,
  permissionModule,
  permissionName,
  roleDisplayName,
} from "./RolePermissionsDetail";
import "../RolesPermissionsSection.css";

const DEFAULT_PAGE_SIZE = 10;

function extractList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.content)) return payload.data.content;
  return [];
}

function extractPage(payload) {
  return {
    totalElements: Number(payload?.totalElements ?? payload?.total ?? 0) || 0,
    totalPages: Number(payload?.totalPages ?? 1) || 1,
  };
}

export default function RolesPermissionsSection() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalElements, setTotalElements] = useState(0);
  const [search, setSearch] = useState("");

  const [selectedRole, setSelectedRole] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [permissionsLoading, setPermissionsLoading] = useState(false);
  const [permissionSearch, setPermissionSearch] = useState("");

  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.organizationRole.getList({
        page,
        size: pageSize,
        sort: ["id,desc"],
      });

      const payload = res?.data ?? res ?? {};
      const list = extractList(payload);
      const pageInfo = extractPage(payload);

      setRoles(list);
      setTotalElements(pageInfo.totalElements);

      if (pageInfo.totalPages > 0 && page >= pageInfo.totalPages) {
        setPage(Math.max(0, pageInfo.totalPages - 1));
      }
    } catch (err) {
      console.error(err);
      setError(err?.message || "Rollarni yuklashda xatolik yuz berdi");
      setRoles([]);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  const fetchPermissions = useCallback(async (roleId) => {
    if (!roleId) {
      setPermissions([]);
      return;
    }
    try {
      setPermissionsLoading(true);
      setError("");
      const res = await api.organizationRole.getPermissions(roleId);
      const list = extractList(res?.data ?? res);
      setPermissions(list);
    } catch (err) {
      console.error(err);
      setError(err?.message || "Ruxsatlarni yuklashda xatolik yuz berdi");
      setPermissions([]);
    } finally {
      setPermissionsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!selectedRole) {
      fetchRoles();
    }
  }, [fetchRoles, selectedRole]);

  const openRoleDetails = useCallback(
    (role) => {
      if (!role?.id) return;
      setSelectedRole(role);
      setPermissionSearch("");
      fetchPermissions(role.id);
    },
    [fetchPermissions]
  );

  const closeRoleDetails = useCallback(() => {
    setSelectedRole(null);
    setPermissions([]);
    setPermissionSearch("");
  }, []);

  const filteredRoles = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return roles;
    return roles.filter((role) =>
      [role.id, role.roleName, role.name, role.description]
        .map((v) => String(v ?? "").toLowerCase())
        .some((v) => v.includes(q))
    );
  }, [roles, search]);

  const filteredPermissions = useMemo(() => {
    const q = permissionSearch.trim().toLowerCase();
    if (!q) return permissions;
    return permissions.filter((permission) =>
      [
        permission?.id,
        permissionName(permission),
        permissionCode(permission),
        permissionModule(permission),
        permissionDescription(permission),
      ]
        .map((v) => String(v ?? "").toLowerCase())
        .some((v) => v.includes(q))
    );
  }, [permissions, permissionSearch]);

  const columns = useMemo(
    () => [
      { key: "id", label: "ID" },
      {
        key: "roleName",
        label: "Rol nomi",
        render: (row) => roleDisplayName(row),
      },
      {
        key: "description",
        label: "Tavsif",
        render: (row) => row?.description || "—",
      },
      { key: "actions", label: "Amallar" },
    ],
    []
  );

  const renderActions = useCallback(
    (row) => (
      <button
        type="button"
        className="global-table-action-btn view"
        title="Ruxsatlarni ko'rish"
        onClick={(event) => {
          event.stopPropagation();
          openRoleDetails(row);
        }}
      >
        <Eye size={15} />
      </button>
    ),
    [openRoleDetails]
  );

  if (selectedRole) {
    return (
      <div className="roles-permissions-section">
        {error && (
          <div className="roles-permissions-error" role="alert">
            {error}
          </div>
        )}

        <RolePermissionsDetail
          role={selectedRole}
          permissions={filteredPermissions}
          totalPermissions={permissions.length}
          loading={permissionsLoading}
          searchValue={permissionSearch}
          onSearchChange={setPermissionSearch}
          onBack={closeRoleDetails}
        />
      </div>
    );
  }

  return (
    <div className="roles-permissions-section">
      {error && (
        <div className="roles-permissions-error" role="alert">
          {error}
        </div>
      )}

      <GlobalTable
        title="Rollar ro'yxati"
        columns={columns}
        data={filteredRoles}
        loading={loading}
        emptyText="Rollar topilmadi"
        rowKey="id"
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(0);
        }}
        searchPlaceholder="Rol bo'yicha qidirish..."
        renderActions={renderActions}
        onRowDoubleClick={(row) => openRoleDetails(row)}
        pagination={{
          page: page + 1,
          pageSize,
          total: totalElements,
        }}
        onPageChange={(nextPage) => setPage(Math.max(0, nextPage - 1))}
        onPageSizeChange={(size) => {
          setPageSize(Number(size) || DEFAULT_PAGE_SIZE);
          setPage(0);
        }}
      />
    </div>
  );
}
