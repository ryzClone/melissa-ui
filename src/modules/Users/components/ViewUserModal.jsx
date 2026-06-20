import { X } from "lucide-react";
import "./AddUserModal.css";

function Field({ label, value }) {
  return (
    <div className="users-form-group">
      <label>{label}</label>
      <div className="users-view-value">
        {value === null || value === undefined || value === ""
          ? "-"
          : String(value)}
      </div>
    </div>
  );
}

function formatRoles(user) {
  if (!Array.isArray(user?.roles) || user.roles.length === 0) return "-";

  return user.roles
    .map((role) => role?.name || role?.roleName || role?.code || "-")
    .join(", ");
}

export default function ViewUserModal({ isOpen, user, onClose }) {
  if (!isOpen || !user) return null;

  const fullName = `${user?.name || ""} ${user?.surname || ""}`.trim();
  const isActive = user?.active ?? user?.enabled ?? true;

  return (
    <div className="users-modal-overlay" onClick={onClose}>
      <div className="users-modal users-view-modal" onClick={(e) => e.stopPropagation()}>
        <button className="users-modal-close" type="button" onClick={onClose}>
          <X size={18} />
        </button>

        <div className="users-modal-header">
          <h2>Foydalanuvchi ma&apos;lumotlari</h2>
          <p>Tanlangan foydalanuvchi tafsilotlari</p>
        </div>

        <div className="users-view-modal-body">
          <div className="users-form-grid two">
            <Field label="Ism va familiya" value={fullName || "-"} />
            <Field label="Username" value={user?.username} />
            <Field label="Telefon" value={user?.phoneNumber} />
            <Field label="Holat" value={isActive ? "Aktiv" : "Nofaol"} />
            <Field label="Rol" value={formatRoles(user)} />
            {user?.profileId != null && user?.profileId !== "" ? (
              <Field label="Profile ID" value={user.profileId} />
            ) : null}
          </div>

          <div className="users-modal-footer users-view-modal-footer">
            <button
              type="button"
              className="users-cancel-btn"
              onClick={onClose}
            >
              Yopish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
