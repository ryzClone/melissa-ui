import { useEffect } from "react";
import { X } from "lucide-react";
import StatusBadge, {
  inferStatusVariant,
} from "@/components/StatusBadge/StatusBadge";
import "../adminModal.css";

export default function NewsViewModal({ open, item, onClose }) {
  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open || !item) return null;

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal admin-modal-wide" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="admin-modal-close"
          onClick={onClose}
          aria-label="Yopish"
        >
          <X size={18} />
        </button>

        {item.image ? (
          <img src={item.image} alt="" className="admin-view-image" />
        ) : null}

        <div className="admin-view-meta">
          <StatusBadge
            label={item.status}
            variant={inferStatusVariant(item.status)}
          />
          <span className="admin-view-date">{item.createdAt}</span>
        </div>

        <h2>{item.title}</h2>
        <p className="admin-view-text">{item.fullDescription}</p>
      </div>
    </div>
  );
}
