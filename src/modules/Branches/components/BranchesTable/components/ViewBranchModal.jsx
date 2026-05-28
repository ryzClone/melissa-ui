import { X } from "lucide-react";
import "./BranchModal.css";

const ADDRESS_FIELDS = [
  { key: "title", label: "Sarlavha" },
  { key: "formattedAddress", label: "To'liq manzil" },
  { key: "country", label: "Mamlakat" },
  { key: "region", label: "Viloyat" },
  { key: "city", label: "Shahar" },
  { key: "district", label: "Tuman" },
  { key: "street", label: "Ko'cha" },
  { key: "house", label: "Uy" },
  { key: "entrance", label: "Kirish" },
  { key: "floor", label: "Qavat" },
  { key: "apartment", label: "Xona" },
  { key: "comment", label: "Izoh" },
  { key: "placeId", label: "Place ID" },
];

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
  if (!isOpen || (!branch && !loading)) return null;

  const address = branch?.address || {};

  return (
    <div className="branch-modal-overlay" onClick={onClose}>
      <div className="branch-modal" onClick={(e) => e.stopPropagation()}>
        <div className="branch-modal-header">
          <div>
            <h3>Filial ma'lumotlari</h3>
            <p>Filialning to'liq tafsilotlari</p>
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
            <div className="branch-view-loading">Yuklanmoqda...</div>
          ) : (
            <>
              <div className="branch-form-grid">
                <Field label="ID" value={branch?.id} />
                <Field label="Filial nomi" value={branch?.name} />
                <Field
                  label="Telefon"
                  value={branch?.phone || branch?.phoneNumber}
                />
                <Field
                  label="Status"
                  value={branch?.active ? "Aktiv" : "No aktiv"}
                />

                {ADDRESS_FIELDS.map((field) => (
                  <Field
                    key={field.key}
                    label={field.label}
                    value={address?.[field.key]}
                  />
                ))}

                <Field label="Latitude" value={address?.latitude} />
                <Field label="Longitude" value={address?.longitude} />
              </div>

              <div className="branch-modal-actions">
                <button
                  type="button"
                  className="branch-secondary-btn"
                  onClick={onClose}
                >
                  Yopish
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
