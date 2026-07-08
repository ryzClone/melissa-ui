import { useEffect, useState } from "react";
import { X } from "lucide-react";
import CustomDropdown from "@/components/CustomDropdown/CustomDropdown";
import {
  MESSAGE_PRIORITY_FORM_OPTIONS,
  MESSAGE_STATUS_FORM_OPTIONS,
} from "../../utils/adminConstants";
import { createEmptyMessage } from "../../utils/adminMockData";
import "../adminModal.css";

export default function MessageFormModal({ open, item, onClose, onSave }) {
  const [form, setForm] = useState(createEmptyMessage());

  useEffect(() => {
    if (!open) return;
    setForm(
      item
        ? {
            title: item.title || "",
            content: item.content || "",
            priority: item.priority || "O‘rta",
            status: item.status || "Faol",
          }
        : createEmptyMessage()
    );
  }, [open, item]);

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

  if (!open) return null;

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave?.({
      ...form,
      title: form.title.trim(),
      content: form.content.trim(),
    });
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={(event) => event.stopPropagation()}>
        <button
          type="button"
          className="admin-modal-close"
          onClick={onClose}
          aria-label="Yopish"
        >
          <X size={18} />
        </button>

        <h2>{item ? "Xabarni tahrirlash" : "Xabar qo‘shish"}</h2>
        <p className="admin-modal-subtitle">
          Dashboard muhim xabarlari uchun ma’lumotlarni kiriting
        </p>

        <form onSubmit={handleSubmit}>
          <div className="admin-form-group">
            <label>Sarlavha</label>
            <input
              value={form.title}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, title: event.target.value }))
              }
              placeholder="Xabar sarlavhasi"
              required
            />
          </div>

          <div className="admin-form-group">
            <label>Matn</label>
            <textarea
              value={form.content}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, content: event.target.value }))
              }
              placeholder="Xabar matni"
              required
            />
          </div>

          <div className="admin-form-grid">
            <div className="admin-form-group">
              <label>Prioritet</label>
              <CustomDropdown
                value={form.priority}
                options={MESSAGE_PRIORITY_FORM_OPTIONS}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, priority: value }))
                }
              />
            </div>

            <div className="admin-form-group">
              <label>Status</label>
              <CustomDropdown
                value={form.status}
                options={MESSAGE_STATUS_FORM_OPTIONS}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, status: value }))
                }
              />
            </div>
          </div>

          <div className="admin-modal-actions">
            <button
              type="button"
              className="admin-secondary-btn"
              onClick={onClose}
            >
              Bekor qilish
            </button>
            <button type="submit" className="admin-save-btn">
              Saqlash
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
