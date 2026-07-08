import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { Search, Pencil, Trash2, Download, Check, X, Eye } from "lucide-react";
import { useTranslation } from "react-i18next";
import GlobalTable from "@/components/GlobalTable/GlobalTable";
import { extractPaginatedResponse } from "@/components/GlobalTable/tablePagination";
import FilterBar, { FilterItem } from "@/components/FilterBar/FilterBar";
import PagePartnerFilter from "@/components/PagePartnerFilter/PagePartnerFilter";
import { useScopedPartnerParams } from "@/hooks/useScopedPartnerParams";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useLatestRequest } from "@/hooks/useLatestRequest";
import { useUsersApi } from "@/hooks/useUsersApi";
import { usePartner } from "@/context/PartnerContext";
import { useAuth } from "@/core/hooks/useAuth";
import StatusBadge, { inferStatusVariant } from "@/components/StatusBadge/StatusBadge";
import { USERS_NAMESPACE } from "@/i18n/namespaces";
import ViewUserModal from "./ViewUserModal";
import "./UsersTableSection.css";
import { organizationRoleApi } from "../../../api/modules/organizationRoleApi";
import CustomDropdown from "@/components/CustomDropdown/CustomDropdown";

function RoleBadge({ role }) {
  const classMap = {
    ROLE_ADMIN: "role-admin",
    ROLE_MODERATOR: "role-moderator",
    ROLE_OPERATOR: "role-operator",
    ROLE_ANALYST: "role-analyst",
    ROLE_USER: "role-user",
  };

  const displayName = role?.replace(/^ROLE_/, "") || role || "";

  return (
    <span className={`users-role-badge ${classMap[role] || ""}`}>
      {displayName}
    </span>
  );
}

const DEFAULT_PAGE_SIZE = 10;

export default function UsersTableSection({ refreshToken = 0 }) {
  const { t } = useTranslation(USERS_NAMESPACE);
  const usersApi = useUsersApi();
  const { isSuperAdmin } = useAuth();
  const { partnerId } = usePartner();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 3000);
  const { canFetch, getParams, getOrganizationParams } = useScopedPartnerParams();
  const { beginRequest, isLatestRequest } = useLatestRequest();
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const [allRoles, setAllRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    username: "",
    password: "",
    name: "",
    surname: "",
    phoneNumber: "",
    roleIds: [],
    profileId: "",
  });

  const [viewedUser, setViewedUser] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const getListParams = useCallback(
    (extra = {}) => {
      const base = {
        page: page - 1,
        size,
        sort: ["id,desc"],
        search: debouncedSearch.trim() || undefined,
        ...extra,
      };

      return isSuperAdmin ? getOrganizationParams(base) : getParams(base);
    },
    [
      page,
      size,
      debouncedSearch,
      isSuperAdmin,
      getOrganizationParams,
      getParams,
    ]
  );

  const fetchRoles = useCallback(async () => {
    if (isSuperAdmin || !canFetch) {
      setAllRoles([]);
      return;
    }

    try {
      setRolesLoading(true);
      const res = await organizationRoleApi.getList({
        page: 0,
        size: 100,
        sort: ["id,desc"],
        ...getParams(),
      });
      const payload = res?.data || res;
      const list =
        payload?.data?.content ||
        payload?.content ||
        payload?.data ||
        payload ||
        [];

      setAllRoles(
        (Array.isArray(list) ? list : []).map((role) => ({
          id: role.id,
          roleId: role.roleId,
          name: role.roleName || role.name || `Role #${role.id}`,
        }))
      );
    } catch (error) {
      console.error(error);
      setAllRoles([]);
    } finally {
      setRolesLoading(false);
    }
  }, [canFetch, getParams, isSuperAdmin]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const fetchUsers = useCallback(async () => {
    if (!canFetch) {
      setUsers([]);
      setTotalPages(1);
      setTotalElements(0);
      setLoading(false);
      return;
    }

    const requestId = beginRequest();
    setLoading(true);

    try {
      const raw = await usersApi.getList(getListParams());

      if (!isLatestRequest(requestId)) return;

      const { content, totalElements: total, totalPages: pages } =
        extractPaginatedResponse(raw);
      setUsers(content);
      setTotalElements(total);
      setTotalPages(pages);
      if (pages > 0 && page > pages) {
        setPage(pages);
      }
    } catch {
      if (!isLatestRequest(requestId)) return;
      setUsers([]);
      setTotalPages(1);
      setTotalElements(0);
    } finally {
      if (isLatestRequest(requestId)) {
        setLoading(false);
      }
    }
  }, [
    page,
    canFetch,
    usersApi,
    getListParams,
    beginRequest,
    isLatestRequest,
  ]);

  const filterKeyRef = useRef(`${partnerId}|${debouncedSearch}`);

  useEffect(() => {
    const nextFilterKey = `${partnerId}|${debouncedSearch}`;
    const filtersChanged = filterKeyRef.current !== nextFilterKey;
    filterKeyRef.current = nextFilterKey;

    if (filtersChanged) {
      setEditingId(null);
      setIsViewOpen(false);
      setViewedUser(null);

      if (page !== 1) {
        setPage(1);
        return;
      }
    }

    fetchUsers();
  }, [fetchUsers, refreshToken, page]);

  const tableUsers = useMemo(
    () =>
      users.map((user) => ({
        ...user,
        active: user?.active ?? user?.enabled ?? true,
      })),
    [users]
  );

  const handleView = useCallback(
    (userEntry) => {
      if (!userEntry) return;

      if (isSuperAdmin) {
        if (!canFetch) return;
        setViewedUser(userEntry);
        setIsViewOpen(true);
        return;
      }

      setViewedUser(userEntry);
      setIsViewOpen(true);
    },
    [isSuperAdmin, canFetch]
  );

  const closeView = useCallback(() => {
    setIsViewOpen(false);
    setViewedUser(null);
  }, []);

  const handleEdit = (userEntry) => {
    if (isSuperAdmin) return;

    setEditingId(userEntry.id);
    setEditForm({
      username: userEntry.username || "",
      password: "",
      name: userEntry.name || "",
      surname: userEntry.surname || "",
      phoneNumber: userEntry.phoneNumber || "",
      roleIds: userEntry.roles?.map((role) => role.id) || [],
      profileId: userEntry.profileId || "",
    });
  };

  const handleSave = async () => {
    if (isSuperAdmin || !editingId) return;
    if (
      !editForm.username.trim() ||
      !editForm.name.trim() ||
      !editForm.phoneNumber.trim() ||
      !editForm.roleIds.length
    ) {
      alert(t("validation.fillRequired"));
      return;
    }
    try {
      await usersApi.update(editingId, {
        username: editForm.username.trim(),
        password: editForm.password || "",
        name: editForm.name.trim(),
        surname: editForm.surname.trim(),
        phoneNumber: editForm.phoneNumber.trim(),
        roleIds: editForm.roleIds.map(Number),
        attachmentId: 0,
      });
      setEditingId(null);
      await fetchUsers();
    } catch (error) {
      console.error(error);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({
      username: "",
      password: "",
      name: "",
      surname: "",
      phoneNumber: "",
      roleIds: [],
      profileId: "",
    });
  };

  const handleDelete = async (id) => {
    if (isSuperAdmin) return;
    if (!window.confirm(t("confirm.deleteMessage"))) return;
    try {
      await usersApi.delete(id);
      if (editingId === id) handleCancel();
      await fetchUsers();
    } catch {
    }
  };

  const columns = useMemo(
    () => [
      {
        key: "name",
        title: t("table.fullName"),
        className: "name-cell",
        render: (row) =>
          !isSuperAdmin && editingId === row.id ? (
            <div className="users-inline-fields">
              <input
                className="users-inline-input"
                value={editForm.name}
                placeholder={t("table.name")}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, name: e.target.value }))
                }
              />
              <input
                className="users-inline-input"
                value={editForm.surname}
                placeholder={t("table.surname")}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, surname: e.target.value }))
                }
              />
            </div>
          ) : (
            `${row.name || ""} ${row.surname || ""}`.trim() || "-"
          ),
      },
      {
        key: "username",
        title: t("table.usernamePhone"),
        render: (row) =>
          !isSuperAdmin && editingId === row.id ? (
            <div className="users-inline-fields">
              <input
                className="users-inline-input"
                value={editForm.username}
                placeholder={t("form.placeholders.username")}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, username: e.target.value }))
                }
              />
              <input
                className="users-inline-input"
                value={editForm.phoneNumber}
                placeholder={t("table.phone")}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, phoneNumber: e.target.value }))
                }
              />
            </div>
          ) : (
            <div className="gt-cell-stack">
              <span>{row.username || "-"}</span>
              <span className="gt-cell-muted">{row.phoneNumber || "-"}</span>
            </div>
          ),
      },
      {
        key: "roles",
        title: t("table.role"),
        render: (row) =>
          !isSuperAdmin && editingId === row.id ? (
            <CustomDropdown
              value={String(editForm.roleIds[0] || "")}
              onChange={(nextValue) =>
                setEditForm((p) => ({
                  ...p,
                  roleIds: nextValue ? [Number(nextValue)] : [],
                }))
              }
              disabled={rolesLoading}
              placeholder={
                rolesLoading
                  ? t("roles.loading")
                  : allRoles.length === 0
                    ? t("roles.noRoles")
                    : t("roles.selectRole")
              }
              options={allRoles.map((role) => ({
                label: role.name,
                value: String(role.id),
              }))}
            />
          ) : row.roles?.length ? (
            <div className="users-role-list">
              {row.roles.map((role) => (
                <RoleBadge key={role.id} role={role.name} />
              ))}
            </div>
          ) : (
            "-"
          ),
      },
      {
        key: "active",
        title: t("table.status"),
        render: (row) => (
          <StatusBadge
            variant={inferStatusVariant(row.active, "active")}
            label={row.active ? t("status.active") : t("status.inactive")}
          />
        ),
      },
    ],
    [t, editingId, editForm, allRoles, rolesLoading, isSuperAdmin]
  );

  const paginationLabels = useMemo(
    () => ({
      total: (count) => t("pagination.total", { count }),
      perPage: t("pagination.rowsPerPage"),
      previous: t("pagination.previous"),
      next: t("pagination.next"),
      actions: t("table.actions"),
    }),
    [t]
  );

  const actions = useMemo(() => {
    if (isSuperAdmin) {
      return [
        {
          label: t("buttons.view"),
          icon: <Eye size={16} />,
          variant: "view",
          onClick: (row) => handleView(row),
        },
      ];
    }

    return [
      {
        label: t("buttons.save"),
        icon: <Check size={15} />,
        variant: "success",
        when: (row) => editingId === row.id,
        onClick: () => handleSave(),
      },
      {
        label: t("buttons.cancel"),
        icon: <X size={15} />,
        variant: "cancel",
        when: (row) => editingId === row.id,
        onClick: () => handleCancel(),
      },
      {
        label: t("buttons.edit"),
        icon: <Pencil size={16} />,
        variant: "edit",
        when: (row) => editingId !== row.id,
        onClick: (row) => handleEdit(row),
      },
      {
        label: t("buttons.delete"),
        icon: <Trash2 size={16} />,
        variant: "delete",
        when: (row) => editingId !== row.id,
        onClick: (row) => handleDelete(row.id),
      },
    ];
  }, [t, isSuperAdmin, editingId, handleView, handleDelete, handleEdit, handleSave]);

  return (
    <>
      {isSuperAdmin && (
        <FilterBar>
          <FilterItem>
            <PagePartnerFilter partnerLabel={t("filters.organization")} />
          </FilterItem>
        </FilterBar>
      )}

      <div className="users-card">
        <div className="users-card-header">
          <h3>{t("table.listTitle")}</h3>
          <div className="users-card-tools">
            <div className="users-search-box">
              <Search size={16} />
              <input
                type="text"
                placeholder={t("search.placeholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button
              className="users-icon-btn"
              type="button"
              title={t("buttons.download")}
            >
              <Download size={16} />
            </button>
          </div>
        </div>

        <GlobalTable
          className="global-table--flat"
          columns={columns}
          data={tableUsers}
          loading={loading}
          emptyText={canFetch ? t("states.noData") : t("states.partnerSelect")}
          loadingText={t("states.loading")}
          paginationLabels={paginationLabels}
          rowKey="id"
          actions={actions}
          pagination={{
            page,
            size,
            totalElements,
            totalPages,
          }}
          onPageChange={setPage}
          onPageSizeChange={setSize}
        />
      </div>

      <ViewUserModal
        isOpen={isViewOpen}
        user={viewedUser}
        onClose={closeView}
      />
    </>
  );
}
