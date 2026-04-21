import { useEffect, useState } from "react";
import { ChevronDown, Phone, X } from "lucide-react";
import "./AddBranchModal.css";

export default function AddBranchModal({ open, onClose }) {
  const [form, setForm] = useState({
    branchName: "",
    phone: "+998",
    address: "",
    manager: "",
    openTime: "09:00AM",
    closeTime: "10:00PM",
    active: true,
    description: "",
  });

  useEffect(() => {
    if (!open) return;

    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Yangi filial:", form);
    onClose();
  };

  return (
    <div className="branch-modal-overlay" onClick={onClose}>
      <div
        className="branch-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="branch-modal-header">
          <div>
            <h2>Yangi filial qo‘shish</h2>
            <p>Yangi filial ma’lumotlarini kiriting</p>
          </div>

          <button
            type="button"
            className="branch-modal-close"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <form className="branch-modal-form" onSubmit={handleSubmit}>
          <div className="branch-form-group">
            <label>Filial nomi</label>
            <input
              type="text"
              placeholder="Masalan: Melissa Chilonzor"
              value={form.branchName}
              onChange={(e) => handleChange("branchName", e.target.value)}
            />
          </div>

          <div className="branch-form-group">
            <label>Telefon raqam</label>
            <div className="branch-input-icon">
              <Phone size={15} />
              <input
                type="text"
                placeholder="+998"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
              />
            </div>
          </div>

          <div className="branch-form-group">
            <label>Manzil</label>
            <input
              type="text"
              placeholder="To‘liq manzilni kiriting"
              value={form.address}
              onChange={(e) => handleChange("address", e.target.value)}
            />
          </div>

          <div className="branch-form-group">
            <label>Menejer</label>
            <div className="branch-input-icon right">
              <input
                type="text"
                placeholder="Masalan: Aziz Raimov"
                value={form.manager}
                onChange={(e) => handleChange("manager", e.target.value)}
              />
              <ChevronDown size={16} />
            </div>
          </div>

          <div className="branch-form-row">
            <div className="branch-form-group">
              <label>Ochilish</label>
              <input
                type="text"
                placeholder="09:00AM"
                value={form.openTime}
                onChange={(e) => handleChange("openTime", e.target.value)}
              />
            </div>

            <div className="branch-form-group">
              <label>Yopilish</label>
              <input
                type="text"
                placeholder="10:00PM"
                value={form.closeTime}
                onChange={(e) => handleChange("closeTime", e.target.value)}
              />
            </div>
          </div>

          <div className="branch-switch-row">
            <span>Holat (Aktiv)</span>

            <button
              type="button"
              className={`branch-switch ${form.active ? "active" : ""}`}
              onClick={() => handleChange("active", !form.active)}
            >
              <span className="branch-switch-thumb" />
            </button>
          </div>

          <div className="branch-form-group">
            <label>Tavsif</label>
            <textarea
              rows="4"
              placeholder="Filial haqida qisqacha ma’lumot..."
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>

          <div className="branch-modal-footer">
            <button
              type="button"
              className="branch-cancel-btn"
              onClick={onClose}
            >
              Bekor qilish
            </button>

            <button type="submit" className="branch-submit-btn">
              Yaratish
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}