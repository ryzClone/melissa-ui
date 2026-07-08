import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import CustomDropdown from "@/components/CustomDropdown/CustomDropdown";
import { NEWS_STATUS_FORM_OPTIONS } from "../../utils/adminConstants";
import { createEmptyNews } from "../../utils/adminMockData";
import "../adminModal.css";

export default function NewsFormModal({ open, item, onClose, onSave }) {
  const [form, setForm] = useState(createEmptyNews());
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setForm(
      item
        ? {
            title: item.title || "",
            shortDescription: item.shortDescription || "",
            fullDescription: item.fullDescription || "",
            status: item.status || "Yangi",
            image: item.image || "",
          }
        : createEmptyNews()
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

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setForm((prev) => ({ ...prev, image: previewUrl }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave?.({
      ...form,
      title: form.title.trim(),
      shortDescription: form.shortDescription.trim(),
      fullDescription: form.fullDescription.trim(),
    });
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div
        className="admin-modal admin-modal-wide"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="admin-modal-close"
          onClick={onClose}
          aria-label="Yopish"
        >
          <X size={18} />
        </button>

        <h2>{item ? "Yangilikni tahrirlash" : "Yangilik qo‘shish"}</h2>
        <p className="admin-modal-subtitle">
          Dashboard yangiliklari uchun ma’lumotlarni kiriting
        </p>

        <form onSubmit={handleSubmit}>
          <div className="admin-form-group full">
            <label>Rasm</label>
            <div className="admin-image-upload">
              {form.image ? (
                <img
                  src={form.image}
                  alt=""
                  className="admin-image-preview"
                />
              ) : (
                <div className="admin-image-placeholder">
                  Rasm yuklanmagan
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleImageChange}
              />
              <button
                type="button"
                className="admin-upload-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                Rasm yuklash
              </button>
            </div>
          </div>

          <div className="admin-form-grid">
            <div className="admin-form-group full">
              <label>Sarlavha</label>
              <input
                value={form.title}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, title: event.target.value }))
                }
                placeholder="Yangilik sarlavhasi"
                required
              />
            </div>

            <div className="admin-form-group full">
              <label>Qisqa tavsif</label>
              <textarea
                value={form.shortDescription}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    shortDescription: event.target.value,
                  }))
                }
                placeholder="Card uchun qisqa matn"
                required
              />
            </div>

            <div className="admin-form-group full">
              <label>To‘liq tavsif</label>
              <textarea
                value={form.fullDescription}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    fullDescription: event.target.value,
                  }))
                }
                placeholder="Modal uchun to‘liq matn"
                required
              />
            </div>

            <div className="admin-form-group">
              <label>Status</label>
              <CustomDropdown
                value={form.status}
                options={NEWS_STATUS_FORM_OPTIONS}
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
