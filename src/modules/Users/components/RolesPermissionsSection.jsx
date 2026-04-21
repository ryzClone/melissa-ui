import { useState } from "react";
import { Plus, ChevronRight, ChevronDown } from "lucide-react";
import "./RolesPermissionsSection.css";

const rolesMock = [
  {
    id: 1,
    name: "Admin",
    color: "purple",
    permissions: {
      Rollar: {
        "Qo‘shish": true,
        "Tahrirlash": true,
        "O‘chirish": true,
        "Ko‘rish": true,
      },
      Foydalanuvchilar: {
        "Qo‘shish": true,
        "Tahrirlash": true,
        "O‘chirish": true,
        "Ko‘rish": true,
      },
    },
  },
  {
    id: 2,
    name: "Moderator",
    color: "blue",
    permissions: {
      Rollar: {
        "Qo‘shish": false,
        "Tahrirlash": false,
        "O‘chirish": false,
        "Ko‘rish": true,
      },
      Foydalanuvchilar: {
        "Qo‘shish": false,
        "Tahrirlash": true,
        "O‘chirish": false,
        "Ko‘rish": true,
      },
    },
  },
  {
    id: 3,
    name: "Operator",
    color: "green",
    permissions: {
      Buyurtmalar: {
        "Ko‘rish": true,
        "Status o‘zgartirish": true,
        "Bekor qilish": false,
      },
    },
  },
  {
    id: 4,
    name: "Tahlilchi",
    color: "orange",
    permissions: {
      Hisobotlar: {
        "Ko‘rish": true,
        "Export": true,
      },
    },
  },
];

function PermissionSection({ title, permissions, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="permission-box">
      <button
        type="button"
        className="permission-box-header"
        onClick={() => setOpen(!open)}
      >
        <div className="permission-box-title">
          <span className="permission-mini-dot" />
          <span>{title}</span>
        </div>

        <ChevronDown
          size={16}
          className={`permission-chevron ${open ? "open" : ""}`}
        />
      </button>

      {open && (
        <div className="permission-box-body">
          {Object.entries(permissions).map(([label, checked]) => (
            <div className="permission-row" key={label}>
              <span>{label}</span>

              <label className="permission-switch">
                <input type="checkbox" checked={checked} readOnly />
                <span className="permission-slider" />
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function RolesPermissionsSection() {
  const [selectedRoleId, setSelectedRoleId] = useState(1);

  const selectedRole =
    rolesMock.find((role) => role.id === selectedRoleId) || rolesMock[0];

  return (
    <div className="roles-layout">
      <div className="roles-sidebar">
        <div className="roles-sidebar-header">
          <h3>Rollar</h3>

          <button className="roles-icon-btn" type="button">
            <Plus size={15} />
          </button>
        </div>

        <div className="roles-list">
          {rolesMock.map((role) => (
            <button
              key={role.id}
              type="button"
              className={`role-item ${selectedRoleId === role.id ? "active" : ""}`}
              onClick={() => setSelectedRoleId(role.id)}
            >
              <div className="role-item-left">
                <span className={`role-dot ${role.color}`} />
                <span>{role.name}</span>
              </div>

              <ChevronRight size={14} />
            </button>
          ))}
        </div>
      </div>

      <div className="roles-content">
        <div className="roles-content-header">
          <h3>{selectedRole.name} ruxsatlari</h3>
          <p>
            Admin roli uchun tizim modullaridan foydalanish ruxsatlarini tahrirlash
          </p>
        </div>

        <div className="roles-permissions-list">
          {Object.entries(selectedRole.permissions).map(
            ([title, permissions], index) => (
              <PermissionSection
                key={title}
                title={title}
                permissions={permissions}
                defaultOpen={index === 0}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
}