import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { BRANCHES_NAMESPACE } from "@/i18n/namespaces";
import "./BranchModal.css";

function Field({ label, value }) {
  return (
    <div className="branch-form-group">
      <label>{label}</label>
      <div className="branch-view-value">
        {value === null || value === undefined || value === ""
          ? "-"
          : String(value)}
      </div>
    </div>
  );
}

export default function ViewBranchModal({ isOpen, branch, loading, onClose }) {
  const { t } = useTranslation(BRANCHES_NAMESPACE);

  const addressFields = [
    { key: "title", label: t("form.title") },
    { key: "formattedAddress", label: t("form.fullAddress") },
    { key: "country", label: t("form.country") },
    { key: "region", label: t("form.region") },
    { key: "city", label: t("form.city") },
    { key: "district", label: t("form.district") },
    { key: "street", label: t("form.street") },
    { key: "house", label: t("form.house") },
    { key: "entrance", label: t("form.entrance") },
    { key: "floor", label: t("form.floor") },
    { key: "apartment", label: t("form.apartment") },
    { key: "comment", label: t("form.comment") },
    { key: "placeId", label: t("form.placeId") },
  ];

  if (!isOpen || (!branch && !loading)) return null;

  const address = branch?.address || {};

  return (
    <div className="branch-modal-overlay" onClick={onClose}>
      <div className="branch-modal" onClick={(e) => e.stopPropagation()}>
        <div className="branch-modal-header">
          <div>
            <h3>{t("modal.view")}</h3>
            <p>{t("modal.viewSubtitle")}</p>
          </div>
          <button
            type="button"
            className="branch-modal-close"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <div className="branch-modal-form">
          {loading ? (
            <div className="branch-view-loading">{t("states.loading")}</div>
          ) : (
            <>
              <div className="branch-form-grid">
                <Field label={t("form.id")} value={branch?.id} />
                <Field label={t("form.name")} value={branch?.name} />
                <Field
                  label={t("form.phone")}
                  value={branch?.phone || branch?.phoneNumber}
                />
                <Field
                  label={t("form.status")}
                  value={
                    branch?.active ? t("status.active") : t("status.inactive")
                  }
                />

                {addressFields.map((field) => (
                  <Field
                    key={field.key}
                    label={field.label}
                    value={address?.[field.key]}
                  />
                ))}

                <Field label={t("form.latitude")} value={address?.latitude} />
                <Field label={t("form.longitude")} value={address?.longitude} />
              </div>

              <div className="branch-modal-actions">
                <button
                  type="button"
                  className="branch-secondary-btn"
                  onClick={onClose}
                >
                  {t("buttons.close")}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
