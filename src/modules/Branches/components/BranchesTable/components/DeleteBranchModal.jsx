import { X } from "lucide-react";
import "./BranchModal.css";

export default function DeleteBranchModal({
  isOpen,
  branch,
  onClose,
  onConfirm,
}) {
  if (!isOpen || !branch) return null;

  return (
    <div className="branch-modal-overlay" onClick={onClose}>
      <div
        className="branch-modal branch-delete-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="branch-modal-header">
          <div>
            <h3>Filialni o‘chirish</h3>
            <p>Bu amalni ortga qaytarib bo‘lmaydi</p>
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
          <p>
            Haqiqatan ham <strong>{branch.name}</strong> filialini
            o‘chirmoqchimisiz?
          </p>

          <p className="branch-delete-warning">
            O‘chirsangiz, ushbu ma’lumotlar qayta tiklanmaydi.
          </p>
        </div>

        <div className="branch-modal-actions">
          <button
            type="button"
            className="branch-secondary-btn"
            onClick={onClose}
          >
            Yo‘q
          </button>

          <button
            type="button"
            className="branch-danger-btn"
            onClick={onConfirm}
          >
            Ha, o‘chirish
          </button>
        </div>
      </div>
    </div>
  );
}