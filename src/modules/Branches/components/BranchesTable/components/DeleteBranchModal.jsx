import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { BRANCHES_NAMESPACE } from "@/i18n/namespaces";
import "./BranchModal.css";

export default function DeleteBranchModal({
  isOpen,
  branch,
  onClose,
  onConfirm,
}) {
  const { t } = useTranslation(BRANCHES_NAMESPACE);

  if (!isOpen || !branch) return null;

  return (
    <div className="branch-modal-overlay" onClick={onClose}>
      <div
        className="branch-modal branch-delete-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="branch-modal-header">
          <div>
            <h3>{t("modal.delete")}</h3>
            <p>{t("modal.deleteSubtitle")}</p>
          </div>

          <button
            type="button"
            className="branch-modal-close"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <div className="branch-delete-content">
          <p>{t("confirm.deleteMessage", { name: branch.name })}</p>

          <p className="branch-delete-warning">{t("confirm.deleteWarning")}</p>
        </div>

        <div className="branch-modal-actions">
          <button
            type="button"
            className="branch-secondary-btn"
            onClick={onClose}
          >
            {t("confirm.no")}
          </button>

          <button
            type="button"
            className="branch-danger-btn"
            onClick={onConfirm}
          >
            {t("confirm.yes")}
          </button>
        </div>
      </div>
    </div>
  );
}
