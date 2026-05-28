import { useMemo, useState, useEffect, useCallback } from "react";
import { Search, Pencil, Trash2, Download, Check, X } from "lucide-react";
import GlobalTable from "@/components/GlobalTable/GlobalTable";
import "./UsersTableSection.css";
import { organizationUserApi } from "../../../api/modules/organizationUserApi";
import { organizationRoleApi } from "../../../api/modules/organizationRoleApi";

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

const pageSize = 5;

export default function UsersTableSection() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
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

  const fetchRoles = useCallback(async () => {
    try {
      setRolesLoading(true);
      const res = await organizationRoleApi.getAll();
      const payload = res?.data;
      const list = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.content)
          ? payload.content
          : [];

      setAllRoles(
        list.map((role) => ({
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
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const raw = await organizationUserApi.getList({
        page: page - 1,
        size: pageSize,
        sort: ["id,desc"],
      });
      const payload = raw?.data?.data || raw?.data || raw;
      setUsers(payload?.content || []);
      setTotalElements(payload?.page?.totalElements || 0);
      setTotalPages(payload?.page?.totalPages || 1);
      if (
        payload?.page?.totalPages &&
        payload.page.totalPages > 0 &&
        page > payload.page.totalPages
      ) {
        setPage(payload.page.totalPages);
      }
    } catch {
      setUsers([]);
      setTotalPages(1);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((item) =>
      [
        item.name,
        item.surname,
        item.username,
        item.phoneNumber,
        item.profileId?.toString(),
        ...(item.roles?.map((role) => role.name) || []),
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [search, users]);

  const handleEdit = (userEntry) => {
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
    if (!editingId) return;
    if (!editForm.username.trim() || !editForm.name.trim() || !editForm.phoneNumber.trim() || !editForm.roleIds.length) {
      alert("Barcha majburiy maydonlarni to'ldiring");
      return;
    }
    try {
      await organizationUserApi.update(editingId, {
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
      alert("Foydalanuvchini yangilashda xatolik yuz berdi");
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
    if (!window.confirm("Foydalanuvchini o'chirmoqchimisiz?")) return;
    try {
      await organizationUserApi.delete(id);
      if (editingId === id) handleCancel();
      await fetchUsers();
    } catch (error) {
      console.error(error);
      alert("Foydalanuvchini o'chirishda xatolik yuz berdi");
    }
  };

  const columns = useMemo(
    () => [
      {
        key: "avatar",
        title: "Rasmi",
        render: (row) => {
          const initials = `${row.name?.[0] || ""}${row.surname?.[0] || ""}`.toUpperCase();
          return <div className="users-avatar">{initials || "U"}</div>;
        },
      },
      {
        key: "name",
        title: "Ism",
        render: (row) =>
          editingId === row.id ? (
            <input
              className="users-inline-input"
              value={editForm.name}
              onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
            />
          ) : (
            row.name || "-"
          ),
      },
      {
        key: "surname",
        title: "Familiya",
        render: (row) =>
          editingId === row.id ? (
            <input
              className="users-inline-input"
              value={editForm.surname}
              onChange={(e) => setEditForm((p) => ({ ...p, surname: e.target.value }))}
            />
          ) : (
            row.surname || "-"
          ),
      },
      {
        key: "username",
        title: "Username",
        render: (row) =>
          editingId === row.id ? (
            <input
              className="users-inline-input"
              value={editForm.username}
              onChange={(e) => setEditForm((p) => ({ ...p, username: e.target.value }))}
            />
          ) : (
            row.username || "-"
          ),
      },
      {
        key: "phoneNumber",
        title: "Telefon raqam",
        render: (row) =>
          editingId === row.id ? (
            <input
              className="users-inline-input"
              value={editForm.phoneNumber}
              onChange={(e) => setEditForm((p) => ({ ...p, phoneNumber: e.target.value }))}
            />
          ) : (
            row.phoneNumber || "-"
          ),
      },
      {
        key: "roles",
        title: "Rollari",
        render: (row) =>
          editingId === row.id ? (
            <select
              className="users-inline-select"
              value={editForm.roleIds[0] || ""}
              onChange={(e) =>
                setEditForm((p) => ({
                  ...p,
                  roleIds: e.target.value ? [Number(e.target.value)] : [],
                }))
              }
              disabled={rolesLoading}
            >
              <option value="">
                {rolesLoading
                  ? "Loading..."
                  : allRoles.length === 0
                    ? "Roles not found"
                    : "Rol tanlang"}
              </option>
              {allRoles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
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
        key: "profileId",
        title: "Profile ID",
        render: (row) => row.profileId || "-",
      },
    ],
    [editingId, editForm, allRoles, rolesLoading]
  );

  const renderActions = useCallback(
    (row) => {
      if (editingId === row.id) {
        return (
          <>
            <button type="button" className="global-table-action-btn success" onClick={handleSave} title="Saqlash">
              <Check size={15} />
            </button>
            <button type="button" className="global-table-action-btn cancel" onClick={handleCancel} title="Bekor qilish">
              <X size={15} />
            </button>
          </>
        );
      }
      return (
        <>
          <button type="button" className="global-table-action-btn edit" onClick={() => handleEdit(row)} title="Tahrirlash">
            <Pencil size={15} />
          </button>
          <button type="button" className="global-table-action-btn delete" onClick={() => handleDelete(row.id)} title="O'chirish">
            <Trash2 size={15} />
          </button>
        </>
      );
    },
    [editingId, handleCancel, handleDelete, handleEdit, handleSave]
  );

  return (
    <div className="users-card">
      <div className="users-card-header">
        <h3>Foydalanuvchilar ro&apos;yxati</h3>
        <div className="users-card-tools">
          <div className="users-search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Qidiruv..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <button className="users-icon-btn" type="button">
            <Download size={16} />
          </button>
        </div>
      </div>

      <GlobalTable
        columns={columns}
        data={filteredUsers}
        loading={loading}
        emptyText="Hech narsa topilmadi"
        rowKey="id"
        renderActions={renderActions}
        pagination={{
          page,
          pageSize,
          total: totalElements,
        }}
        onPageChange={setPage}
      />
    </div>
  );
}
