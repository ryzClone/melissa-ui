import { useMemo, useState } from "react";
import { Search, Pencil, Trash2, Download, Check, X } from "lucide-react";
import "./UsersTableSection.css";

const initialUsers = [
  {
    id: 1,
    initials: "AR",
    firstName: "Aziz",
    lastName: "Raimov",
    username: "@aziz_admin",
    phone: "+998 90 123 45 67",
    role: "Admin",
    status: "Faol",
  },
  {
    id: 2,
    initials: "NK",
    firstName: "Nilufar",
    lastName: "Karimova",
    username: "@nilu_mod",
    phone: "+998 97 765 43 21",
    role: "Moderator",
    status: "Faol",
  },
  {
    id: 3,
    initials: "JT",
    firstName: "Jasur",
    lastName: "To‘rayev",
    username: "@jasur_op",
    phone: "+998 93 111 22 33",
    role: "Operator",
    status: "Faol",
  },
  {
    id: 4,
    initials: "MS",
    firstName: "Malika",
    lastName: "Saidova",
    username: "@malika_t",
    phone: "+998 94 444 55 66",
    role: "Tahlilchi",
    status: "Faol",
  },
  {
    id: 5,
    initials: "SB",
    firstName: "Sardor",
    lastName: "Bekmurodov",
    username: "@sardor_op",
    phone: "+998 90 999 88 77",
    role: "Operator",
    status: "Faol",
  },
];

function RoleBadge({ role }) {
  const classMap = {
    Admin: "role-admin",
    Moderator: "role-moderator",
    Operator: "role-operator",
    Tahlilchi: "role-analyst",
  };

  return <span className={`users-role-badge ${classMap[role] || ""}`}>{role}</span>;
}

function StatusBadge({ status }) {
  return <span className="users-status-badge">{status}</span>;
}

export default function UsersTableSection() {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    phone: "",
    role: "",
    status: "",
  });

  const pageSize = 5;
  const roles = ["Admin", "Moderator", "Operator", "Tahlilchi"];
  const statuses = ["Faol", "Nofaol"];

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return users;

    return users.filter((item) =>
      [
        item.firstName,
        item.lastName,
        item.username,
        item.phone,
        item.role,
        item.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [search, users]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));

  const paginatedUsers = filteredUsers.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const handleEdit = (user) => {
    setEditingId(user.id);
    setEditForm({
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      phone: user.phone,
      role: user.role,
      status: user.status,
    });
  };

  const handleSave = () => {
    setUsers((prev) =>
      prev.map((item) =>
        item.id === editingId
          ? {
              ...item,
              ...editForm,
              initials: `${editForm.firstName?.[0] || ""}${editForm.lastName?.[0] || ""}`.toUpperCase(),
            }
          : item
      )
    );
    setEditingId(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({
      firstName: "",
      lastName: "",
      username: "",
      phone: "",
      role: "",
      status: "",
    });
  };

  const handleDelete = (id) => {
    const confirmDelete = window.confirm("Foydalanuvchini o‘chirmoqchimisiz?");
    if (!confirmDelete) return;

    setUsers((prev) => prev.filter((item) => item.id !== id));

    if (editingId === id) {
      handleCancel();
    }
  };

  return (
    <div className="users-card">
      <div className="users-card-header">
        <h3>Foydalanuvchilar ro‘yxati</h3>

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

      <div className="users-table-wrap">
        <table className="users-table">
          <thead>
            <tr>
              <th>Rasmi</th>
              <th>Ism</th>
              <th>Familiya</th>
              <th>Username</th>
              <th>Telefon raqam</th>
              <th>Rollari</th>
              <th>Holat</th>
              <th>Harakatlar</th>
            </tr>
          </thead>

          <tbody>
            {paginatedUsers.map((user) => {
              const isEditing = editingId === user.id;

              return (
                <tr key={user.id}>
                  <td>
                    <div className="users-avatar">{user.initials}</div>
                  </td>

                  <td>
                    {isEditing ? (
                      <input
                        className="users-inline-input"
                        value={editForm.firstName}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            firstName: e.target.value,
                          }))
                        }
                      />
                    ) : (
                      user.firstName
                    )}
                  </td>

                  <td>
                    {isEditing ? (
                      <input
                        className="users-inline-input"
                        value={editForm.lastName}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            lastName: e.target.value,
                          }))
                        }
                      />
                    ) : (
                      user.lastName
                    )}
                  </td>

                  <td className="users-muted">
                    {isEditing ? (
                      <input
                        className="users-inline-input"
                        value={editForm.username}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            username: e.target.value,
                          }))
                        }
                      />
                    ) : (
                      user.username
                    )}
                  </td>

                  <td className="users-muted">
                    {isEditing ? (
                      <input
                        className="users-inline-input"
                        value={editForm.phone}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                      />
                    ) : (
                      user.phone
                    )}
                  </td>

                  <td>
                    {isEditing ? (
                      <select
                        className="users-inline-select"
                        value={editForm.role}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            role: e.target.value,
                          }))
                        }
                      >
                        {roles.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <RoleBadge role={user.role} />
                    )}
                  </td>

                  <td>
                    {isEditing ? (
                      <select
                        className="users-inline-select"
                        value={editForm.status}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            status: e.target.value,
                          }))
                        }
                      >
                        {statuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <StatusBadge status={user.status} />
                    )}
                  </td>

                  <td>
                    <div className="users-actions">
                      {isEditing ? (
                        <>
                          <button
                            type="button"
                            className="users-action-btn success"
                            onClick={handleSave}
                            title="Saqlash"
                          >
                            <Check size={15} />
                          </button>
                          <button
                            type="button"
                            className="users-action-btn cancel"
                            onClick={handleCancel}
                            title="Bekor qilish"
                          >
                            <X size={15} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            className="users-action-btn edit"
                            onClick={() => handleEdit(user)}
                            title="Tahrirlash"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            type="button"
                            className="users-action-btn danger"
                            onClick={() => handleDelete(user.id)}
                            title="O‘chirish"
                          >
                            <Trash2 size={15} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}

            {paginatedUsers.length === 0 && (
              <tr>
                <td colSpan="8" className="users-empty">
                  Hech narsa topilmadi
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="users-table-footer">
        <span>
          {filteredUsers.length > 0
            ? `${(page - 1) * pageSize + 1} tadan ${Math.min(
                page * pageSize,
                filteredUsers.length
              )} gacha foydalanuvchi ko‘rsatilmoqda`
            : "0 ta foydalanuvchi"}
        </span>

        <div className="users-pagination">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          >
            Oldingi
          </button>

          {Array.from({ length: totalPages }).map((_, index) => {
            const current = index + 1;
            return (
              <button
                key={current}
                type="button"
                className={page === current ? "active" : ""}
                onClick={() => setPage(current)}
              >
                {current}
              </button>
            );
          })}

          <button
            type="button"
            disabled={page === totalPages}
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
          >
            Keyingi
          </button>
        </div>
      </div>
    </div>
  );
}