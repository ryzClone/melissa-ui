import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { USERS_NAMESPACE } from "@/i18n/namespaces";
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
  const { t } = useTranslation(USERS_NAMESPACE);

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
          <h2>{t("modal.view")}</h2>
          <p>{t("modal.viewSubtitle")}</p>
        </div>

        <div className="users-view-modal-body">
          <div className="users-form-grid two">
            <Field label={t("form.fullName")} value={fullName || "-"} />
            <Field label={t("form.username")} value={user?.username} />
            <Field label={t("form.phone")} value={user?.phoneNumber} />
            <Field
              label={t("form.status")}
              value={isActive ? t("status.active") : t("status.inactive")}
            />
            <Field label={t("form.role")} value={formatRoles(user)} />
            {user?.profileId != null && user?.profileId !== "" ? (
              <Field label={t("form.profileId")} value={user.profileId} />
            ) : null}
          </div>

          <div className="users-modal-footer users-view-modal-footer">
            <button
              type="button"
              className="users-cancel-btn"
              onClick={onClose}
            >
              {t("buttons.close")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
