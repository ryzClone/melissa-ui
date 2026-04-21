import { useEffect, useState } from "react";
import { X } from "lucide-react";
import "./BranchModal.css";

export default function EditBranchModal({ isOpen, branch, onClose, onSave }) {
  const [form, setForm] = useState({
    id: "",
    name: "",
    phone: "",
    address: "",
    status: "Aktiv",
  });

  useEffect(() => {
    if (branch) {
      setForm({
        id: branch.id || "",
        name: branch.name || "",
        phone: branch.phone || "",
        address: branch.address || "",
        status: branch.status || "Aktiv",
      });
    }
  }, [branch]);

  if (!isOpen || !branch) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="branch-modal-overlay" onClick={onClose}>
      <div className="branch-modal" onClick={(e) => e.stopPropagation()}>
        <div className="branch-modal-header">
          <div>
            <h3>Filialni tahrirlash</h3>
            <p>Kerakli maydonlarni o‘zgartiring</p>
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
          <div className="branch-form-grid">
            <div className="branch-form-group">
              <label>ID</label>
              <input type="text" name="id" value={form.id} disabled />
            </div>

            <div className="branch-form-group">
              <label>Filial nomi</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="branch-form-group">
              <label>Telefon raqam</label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="branch-form-group branch-form-group-full">
              <label>Manzil</label>
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                required
              />
            </div>

            <div className="branch-form-group branch-form-group-full">
              <label>Holat</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                <option value="Aktiv">Aktiv</option>
                <option value="No aktiv">No aktiv</option>
              </select>
            </div>
          </div>

          <div className="branch-modal-actions">
            <button
              type="button"
              className="branch-secondary-btn"
              onClick={onClose}
            >
              Bekor qilish
            </button>

            <button type="submit" className="branch-primary-btn">
              Saqlash
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}