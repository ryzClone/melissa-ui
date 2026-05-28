import { useEffect, useState } from "react";
import { MapPin, X } from "lucide-react";
import AddBranchMapModal from "../../BranchesHeader/components/AddBranchMapModal";
import "../../BranchesHeader/components/AddBranchMapModal.css";
import "./BranchModal.css";

const EMPTY_ADDRESS = {
  latitude: "",
  longitude: "",
  formattedAddress: "",
  country: "",
  city: "",
  region: "",
  district: "",
  street: "",
  house: "",
  entrance: "",
  floor: "",
  apartment: "",
  comment: "",
  placeId: "",
};

const EMPTY_FORM = {
  name: "",
  phoneNumber: "",
  active: true,
  address: { ...EMPTY_ADDRESS },
};

function toInputValue(value) {
  if (value === null || value === undefined) return "";
  return String(value);
}

function mapBranchToForm(branch) {
  const address = branch?.address ?? {};

  return {
    name: toInputValue(branch?.name),
    phoneNumber: toInputValue(branch?.phoneNumber ?? branch?.phone),
    active: Boolean(branch?.active ?? true),
    address: {
      latitude: toInputValue(address.latitude),
      longitude: toInputValue(address.longitude),
      formattedAddress: toInputValue(address.formattedAddress),
      country: toInputValue(address.country),
      city: toInputValue(address.city),
      region: toInputValue(address.region),
      district: toInputValue(address.district),
      street: toInputValue(address.street),
      house: toInputValue(address.house),
      entrance: toInputValue(address.entrance),
      floor: toInputValue(address.floor),
      apartment: toInputValue(address.apartment),
      comment: toInputValue(address.comment),
      placeId: toInputValue(address.placeId),
    },
  };
}

export function buildBranchUpdatePayload(form) {
  return {
    name: form.name,
    phoneNumber: form.phoneNumber,
    active: Boolean(form.active),
    address: {
      title: "",
      latitude: Number(form.address?.latitude || 0),
      longitude: Number(form.address?.longitude || 0),
      formattedAddress: form.address?.formattedAddress || "",
      country: form.address?.country || "",
      city: form.address?.city || "",
      region: form.address?.region || "",
      district: form.address?.district || "",
      street: form.address?.street || "",
      house: form.address?.house || "",
      entrance: form.address?.entrance || "",
      floor: form.address?.floor || "",
      apartment: form.address?.apartment || "",
      comment: form.address?.comment || "",
      placeId: form.address?.placeId || "",
    },
  };
}

const ADDRESS_FIELDS = [
  { name: "address.latitude", label: "Latitude", type: "number" },
  { name: "address.longitude", label: "Longitude", type: "number" },
  { name: "address.country", label: "Mamlakat", type: "text" },
  { name: "address.city", label: "Shahar", type: "text" },
  { name: "address.region", label: "Viloyat", type: "text" },
  { name: "address.district", label: "Tuman", type: "text" },
  { name: "address.street", label: "Ko'cha", type: "text" },
  { name: "address.house", label: "Uy", type: "text" },
  { name: "address.entrance", label: "Kirish", type: "text" },
  { name: "address.floor", label: "Qavat", type: "text" },
  { name: "address.apartment", label: "Xona", type: "text" },
];

export default function EditBranchModal({
  isOpen,
  branch,
  loading,
  onClose,
  onSave,
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setShowMap(false);
      return;
    }
    setForm(branch ? mapBranchToForm(branch) : EMPTY_FORM);
  }, [isOpen, branch]);

  if (!isOpen || !branch) return null;

  const handleFieldChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("address.")) {
      const field = name.split(".")[1];

      setForm((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [field]: value,
        },
      }));

      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLocationSelect = (location) => {
    setShowMap(false);
    setForm((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        latitude: String(location.latitude ?? 0),
        longitude: String(location.longitude ?? 0),
        formattedAddress:
          location.formattedAddress || location.manzil || prev.address.formattedAddress,
      },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (loading) return;
    onSave(buildBranchUpdatePayload(form));
  };

  const getAddressFieldValue = (fieldName) => {
    const key = fieldName.split(".")[1];
    return form.address[key] ?? "";
  };

  const hasCoords =
    form.address.latitude !== "" &&
    form.address.longitude !== "" &&
    !Number.isNaN(Number(form.address.latitude)) &&
    !Number.isNaN(Number(form.address.longitude));

  return (
    <div className="branch-modal-overlay" onClick={onClose}>
      <div className="branch-modal" onClick={(e) => e.stopPropagation()}>
        <div className="branch-modal-header">
          <div>
            <h3>Filialni tahrirlash</h3>
            <p>Filial ma&apos;lumotlarini yangilang</p>
          </div>
          <button
            type="button"
            className="branch-modal-close"
            onClick={onClose}
            disabled={loading}
          >
            <X size={18} />
          </button>
        </div>

        <form className="branch-modal-body" onSubmit={handleSubmit}>
          <div className="branch-modal-form">
          <div className="branch-form-grid">
            <div className="branch-form-group">
              <label htmlFor="branch-name">Filial nomi</label>
              <input
                id="branch-name"
                name="name"
                value={form.name}
                onChange={handleFieldChange}
                disabled={loading}
                required
              />
            </div>

            <div className="branch-form-group">
              <label htmlFor="branch-phone">Telefon</label>
              <input
                id="branch-phone"
                name="phoneNumber"
                value={form.phoneNumber}
                onChange={handleFieldChange}
                disabled={loading}
              />
            </div>

            <p className="branch-form-section-title">Manzil</p>

            <div className="branch-form-group branch-form-group-full">
              <div className="branch-address-label-row">
                <label htmlFor="address.formattedAddress">
                  To&apos;liq manzil
                  <span style={{ color: "var(--red, #dc2626)" }}>*</span>
                </label>

                <button
                  type="button"
                  className="branch-map-link"
                  onClick={() => setShowMap(true)}
                  disabled={loading}
                >
                  <MapPin size={16} />
                  Mapdan tanlash
                </button>
              </div>

              <input
                id="address.formattedAddress"
                type="text"
                name="address.formattedAddress"
                value={form.address?.formattedAddress ?? ""}
                onChange={handleFieldChange}
                maxLength={255}
                required
                disabled={loading}
                placeholder="Masalan: Toshkent, Chilonzor, Bunyodkor ko‘chasi"
              />
            </div>

            {showMap && (
              <div className="branch-edit-inline-map-container branch-form-group-full">
                <AddBranchMapModal
                  value={{
                    latitude: hasCoords
                      ? Number(form.address.latitude)
                      : 41.311081,
                    longitude: hasCoords
                      ? Number(form.address.longitude)
                      : 69.240562,
                  }}
                  onSelect={handleLocationSelect}
                  onClose={() => setShowMap(false)}
                />
              </div>
            )}

            {ADDRESS_FIELDS.map((field) => (
              <div
                key={field.name}
                className={`branch-form-group${field.full ? " branch-form-group-full" : ""}`}
              >
                <label htmlFor={field.name}>{field.label}</label>
                <input
                  id={field.name}
                  name={field.name}
                  type={field.type}
                  value={getAddressFieldValue(field.name)}
                  onChange={handleFieldChange}
                  disabled={loading}
                  step={field.type === "number" ? "any" : undefined}
                />
              </div>
            ))}

            <div className="branch-form-group branch-form-group-full">
              <label htmlFor="address.comment">Izoh</label>
              <textarea
                id="address.comment"
                name="address.comment"
                value={form.address.comment}
                onChange={handleFieldChange}
                disabled={loading}
                rows={3}
              />
            </div>

            <div className="branch-form-group branch-form-group-full">
              <label htmlFor="address.placeId">Place ID</label>
              <input
                id="address.placeId"
                name="address.placeId"
                type="text"
                value={form.address?.placeId ?? ""}
                onChange={handleFieldChange}
                disabled={loading}
              />
            </div>

            <div className="branch-status-card">
              <span>Holat: {form.active ? "Aktiv" : "No aktiv"}</span>

              <button
                type="button"
                className={`branch-status-switch ${form.active ? "active" : ""}`}
                onClick={() =>
                  setForm((prev) => ({ ...prev, active: !prev.active }))
                }
              >
                <span />
              </button>
            </div>
          </div>
          </div>

          <div className="branch-modal-actions">
            <button
              type="button"
              className="branch-secondary-btn"
              onClick={onClose}
              disabled={loading}
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="branch-primary-btn"
              disabled={loading}
            >
              {loading ? "Saqlanmoqda..." : "Saqlash"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
