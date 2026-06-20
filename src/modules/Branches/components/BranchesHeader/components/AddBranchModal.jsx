import { useEffect, useState, useRef } from "react";
import { Phone, X, MapPin, ChevronDown } from "lucide-react";
import { useGlobalNotification } from "@/hooks/useGlobalNotification";
import { useScopedPartnerParams, PARTNER_SELECT_MESSAGE } from "@/hooks/useScopedPartnerParams";
import { useAuth } from "@/core/hooks/useAuth";
import { api } from "@/api";
import "./AddBranchModal.css";
import AddBranchMapModal from "./AddBranchMapModal";

// --- Constants ---
const REGION_OPTIONS = [
  {
    value: "Toshkent",
    label: "Toshkent",
    cities: [
      {
        value: "Toshkent Shahri",
        label: "Toshkent Shahri",
        districts: [
          { value: "Chilonzor", label: "Chilonzor" },
          { value: "Yunusobod", label: "Yunusobod" },
          { value: "Yakkasaroy", label: "Yakkasaroy" },
        ],
      },
      {
        value: "Bekobod",
        label: "Bekobod",
        districts: [{ value: "Bekobod Tumani", label: "Bekobod Tumani" }],
      },
    ],
  },
  {
    value: "Samarqand",
    label: "Samarqand",
    cities: [
      {
        value: "Samarqand Shahri",
        label: "Samarqand Shahri",
        districts: [
          { value: "Samarqand Tumani", label: "Samarqand Tumani" },
        ],
      },
    ],
  },
];

const getDefaultAddress = () => ({
  latitude: 0,
  longitude: 0,
  formattedAddress: "",
  country: "Uzbekistan",
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
});

const initialForm = {
  name: "",
  phoneNumber: "+998 ",
  active: true,
  address: getDefaultAddress(),
};

// --- Phone Mask: always starts with "+998 ", only allows 9 digits after, formatted on-fly
function formatPhoneUz(value) {
  let cleaned = value.replace(/[^\d]/g, "");
  if (cleaned.startsWith("998")) cleaned = cleaned.slice(3);
  cleaned = cleaned.slice(0, 9);
  let mask = "+998";
  if (cleaned.length > 0) mask += " " + cleaned.slice(0, 2);
  if (cleaned.length > 2) mask += " " + cleaned.slice(2, 5);
  if (cleaned.length > 5) mask += " " + cleaned.slice(5, 7);
  if (cleaned.length > 7) mask += " " + cleaned.slice(7, 9);
  return mask;
}

// --- Reusable Custom Dropdown Component ---
function CustomDropdown({
  label,
  value,
  placeholder = "Tanlang",
  options = [],
  onChange,
  disabled,
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleTriggerClick = () => {
    if (disabled) return;
    setOpen((prev) => !prev);
  };

  const handleSelect = (opt) => {
    onChange(opt.value);
    setOpen(false);
  };

  const selectedLabel = options.find((o) => o.value === value)?.label;

  return (
    <div
      ref={ref}
      className={
        [
          "addbranch-custom-select",
          open ? "open" : "",
          disabled ? "addbranch-custom-select-disabled" : "",
          className,
        ].join(" ")
      }
    >
      <div
        className="addbranch-custom-select-trigger"
        tabIndex={0}
        onClick={handleTriggerClick}
        aria-disabled={disabled}
      >
        <span>
          {label && <span className="addbranch-custom-select-label">{label}</span>}
          {selectedLabel || <span className="addbranch-custom-select-placeholder">{placeholder}</span>}
        </span>
        <span className="addbranch-custom-select-chevron">
          <ChevronDown size={19} />
        </span>
      </div>
      {open && !disabled && (
        <ul className="addbranch-custom-select-menu">
          {options.length === 0 && (
            <li className="addbranch-custom-select-option addbranch-custom-select-nooption">
              Variant yo'q
            </li>
          )}
          {options.map((opt) => (
            <li
              key={opt.value}
              className={[
                "addbranch-custom-select-option",
                value === opt.value ? "selected" : "",
              ].join(" ")}
              onClick={() => handleSelect(opt)}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function AddBranchModal({ open, onClose, onRefresh }) {
  const { success, error: notifyError } = useGlobalNotification();
  const { isSuperAdmin } = useAuth();
  const { canFetch, getOrganizationParams } = useScopedPartnerParams();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);

  // For select chaining (Region→City→District)
  const [regionOptions] = useState(REGION_OPTIONS);
  const [cityOptions, setCityOptions] = useState([]);
  const [districtOptions, setDistrictOptions] = useState([]);
  const phoneInputRef = useRef();

  // Modal handler
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && !loading) {
        onClose();
      }
    };
    if (open) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "auto";
    };
  }, [open, onClose, loading]);

  // Reset form on open
  useEffect(() => {
    if (open) setForm(initialForm);
  }, [open]);

  // Update city/district select options when region/city change
  useEffect(() => {
    const regionObj = regionOptions.find(item => item.value === form.address.region);
    if (regionObj) {
      setCityOptions(regionObj.cities || []);
      if (!regionObj.cities.some(city => city.value === form.address.city)) {
        setForm((prev) => ({
          ...prev,
          address: {
            ...prev.address,
            city: "",
            district: "",
          },
        }));
      }
    } else {
      setCityOptions([]);
    }
  }, [form.address.region, regionOptions]);

  useEffect(() => {
    const regionObj = regionOptions.find((item) => item.value === form.address.region);
    const cityObj = regionObj?.cities?.find((c) => c.value === form.address.city);
    if (cityObj) {
      setDistrictOptions(cityObj.districts || []);
      if (!cityObj.districts.some(d => d.value === form.address.district)) {
        setForm((prev) => ({
          ...prev,
          address: {
            ...prev.address,
            district: "",
          },
        }));
      }
    } else {
      setDistrictOptions([]);
    }
  }, [form.address.city, form.address.region, regionOptions]);

  if (!open) return null;

  // Field change logic
  const handleInputChange = (field, val) => {
    if (field.startsWith("address.")) {
      setForm((prev) => ({
        ...prev,
        address: { ...prev.address, [field.split(".")[1]]: val },
      }));
    } else {
      setForm((prev) => ({ ...prev, [field]: val }));
    }
  };

  // Phone input handlers
  const handlePhoneChange = (e) => {
    let input = e.target.value;
    if (!input.startsWith("+998")) {
      input = "+998 " + input.replace(/[^\d]/g, "");
    }
    const masked = formatPhoneUz(input);
    handleInputChange("phoneNumber", masked);
    if (phoneInputRef.current) {
      setTimeout(() => {
        let val = phoneInputRef.current.value;
        let pos = val.length;
        phoneInputRef.current.setSelectionRange(pos, pos);
      }, 0);
    }
  };

  const handlePhoneKeyDown = (e) => {
    if (
      phoneInputRef.current &&
      phoneInputRef.current.selectionStart <= 5 &&
      (e.key === "Backspace" || e.key === "Delete" || e.key === "ArrowLeft")
    ) {
      e.preventDefault();
      phoneInputRef.current.setSelectionRange(6, 6);
    }
  };

  // Lat/Lon: on focus, clear 0; on blur, restore 0 if empty
  const handleLatFocus = () => {
    if (form.address.latitude === 0) handleInputChange("address.latitude", "");
  };
  const handleLonFocus = () => {
    if (form.address.longitude === 0) handleInputChange("address.longitude", "");
  };
  const handleLatBlur = (e) => {
    const val = e.target.value;
    handleInputChange(
      "address.latitude",
      val === "" || Number.isNaN(Number(val)) ? 0 : Number(val)
    );
  };
  const handleLonBlur = (e) => {
    const val = e.target.value;
    handleInputChange(
      "address.longitude",
      val === "" || Number.isNaN(Number(val)) ? 0 : Number(val)
    );
  };

  const handleClose = () => {
    if (loading) return;
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate branch name
    if (!form.name.trim()) {
      console.error("Filial nomini kiriting");
      return;
    }

    // Validate phone
    if (
      !form.phoneNumber.trim() ||
      form.phoneNumber.length !== 17 ||
      !/^\+998 \d{2} \d{3} \d{2} \d{2}$/.test(form.phoneNumber)
    ) {
      console.error("Telefon raqamni to'g'ri kiriting (+998 99 999 99 99)");
      return;
    }

    const payload = {
      name: form.name.trim(),
      phoneNumber: form.phoneNumber.trim(),
      active: form.active,
      address: {
        latitude: Number(form.address.latitude) || 0,
        longitude: Number(form.address.longitude) || 0,
        formattedAddress: form.address.formattedAddress.trim(),
        country: form.address.country.trim(),
        city: form.address.city.trim(),
        region: form.address.region.trim(),
        district: form.address.district.trim(),
        street: form.address.street.trim(),
        house: form.address.house.trim(),
        entrance: form.address.entrance.trim(),
        floor: form.address.floor.trim(),
        apartment: form.address.apartment.trim(),
        comment: form.address.comment.trim(),
        placeId: form.address.placeId.trim(),
      },
    };

    try {
      setLoading(true);

      let res;

      if (isSuperAdmin) {
        if (!canFetch) {
          notifyError(PARTNER_SELECT_MESSAGE);
          return;
        }

        const { organizationId } = getOrganizationParams();
        if (!organizationId) {
          notifyError(PARTNER_SELECT_MESSAGE);
          return;
        }

        res = await api.organizationBranch.createForOrganization(
          organizationId,
          payload
        );
      } else {
        res = await api.organizationBranch.create(payload);
      }

      if (res?.errorMessage) {
        notifyError(res.errorMessage);
        return;
      }
      success("Muvaffaqiyatli yaratildi");
      onClose();
      if (onRefresh) await onRefresh();
    } catch (error) {
      console.error(error?.message || "Filial yaratishda xatolik");
    } finally {
      setLoading(false);
    }
  };

  // Map modal: handle location select
  const handleLocationSelect = (location) => {
    setShowMap(false);
    setForm((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        latitude: location.latitude ?? 0,
        longitude: location.longitude ?? 0,
        formattedAddress: location.formattedAddress || "",
        country: location.country || "Uzbekistan",
        city: location.city || "",
        region: location.region || "",
        district: location.district || "",
        street: location.street || "",
        house: location.house || "",
        placeId: location.placeId || "",
      },
    }));
  };

  // --- Render ---
  return (
    <div className="addbranch-modal-overlay" onClick={handleClose}>
      <div className="addbranch-modal" onClick={e => e.stopPropagation()}>
        <div className="addbranch-modal-header">
          <div>
            <h2>Yangi filial qo‘shish</h2>
            <p>Yangi filial ma’lumotlarini kiriting</p>
          </div>
          <button
            type="button"
            className="addbranch-modal-close"
            onClick={handleClose}
            disabled={loading}
          >
            <X size={18} />
          </button>
        </div>
        <form className="addbranch-modal-form" onSubmit={handleSubmit}>
          {/* Branch Name */}
          <div className="addbranch-form-group">
            <label>Filial nomi</label>
            <input
              type="text"
              value={form.name}
              maxLength={100}
              placeholder="Masalan: Melissa Chilonzor"
              onChange={e => handleInputChange("name", e.target.value)}
              disabled={loading}
              required
            />
          </div>

          {/* Phone */}
          <div className="addbranch-form-group">
            <label>Telefon raqam</label>
            <div className="addbranch-input-icon">
              <Phone size={15} />
              <input
                className="addbranch-map-phone"
                type="text"
                placeholder="+998"
                value={form.phoneNumber}
                ref={phoneInputRef}
                onChange={handlePhoneChange}
                onKeyDown={handlePhoneKeyDown}
                disabled={loading}
                maxLength={17}
                inputMode="numeric"
                pattern="\+998 \d{2} \d{3} \d{2} \d{2}"
                autoComplete="off"
                required
              />
            </div>
          </div>

          {/* Address - map picker and modal inside the form, below this group */}
          <div className="addbranch-form-group">
            <label>
              To‘liq manzil
              <button
                type="button"
                className="addbranch-map-link"
                onClick={() => setShowMap(true)}
                title="Mapdan tanlash"
                disabled={loading}
                tabIndex={0}
              >
                <MapPin size={16} className="addbranch-map-linkicon" />
                <span>Mapdan tanlash</span>
              </button>
            </label>
            <input
              className="addbranch-map-formattedaddress"
              type="text"
              value={form.address.formattedAddress}
              maxLength={128}
              onChange={e => handleInputChange("address.formattedAddress", e.target.value)}
              disabled={loading}
              placeholder="Masalan: Toshkent, Chilonzor, Bunyodkor ko‘chasi"
            />
          </div>

          {/* Map selection shown inside modal directly under the full address */}
          {showMap && (
            <div className="addbranch-map-container">
              <AddBranchMapModal
                value={{
                  latitude: form.address.latitude,
                  longitude: form.address.longitude,
                }}
                onSelect={handleLocationSelect}
                onClose={() => setShowMap(false)}
              />
            </div>
          )}

          {/* Lat/Lon */}
          <div className="addbranch-form-row">
            <div className="addbranch-form-group">
              <label>Latitude</label>
              <input
                className="addbranch-map-latitude"
                type="number"
                step="any"
                value={form.address.latitude}
                onChange={e => handleInputChange("address.latitude", e.target.value)}
                onFocus={handleLatFocus}
                onBlur={handleLatBlur}
                disabled={loading}
                placeholder="Latitude"
              />
            </div>
            <div className="addbranch-form-group">
              <label>Longitude</label>
              <input
                className="addbranch-map-longitude"
                type="number"
                step="any"
                value={form.address.longitude}
                onChange={e => handleInputChange("address.longitude", e.target.value)}
                onFocus={handleLonFocus}
                onBlur={handleLonBlur}
                disabled={loading}
                placeholder="Longitude"
              />
            </div>
          </div>

          {/* Country & Region */}
          <div className="addbranch-form-row">
            <div className="addbranch-form-group">
              <label>Mamlakat</label>
              <input
                className="addbranch-map-country"
                type="text"
                value={form.address.country}
                readOnly
                disabled
                placeholder="Uzbekistan"
              />
            </div>
            <div className="addbranch-form-group">
              <label>Viloyat / Region</label>
              <CustomDropdown
                value={form.address.region}
                options={regionOptions}
                placeholder="Tanlang"
                onChange={(val) => handleInputChange("address.region", val)}
                disabled={loading}
              />
            </div>
          </div>

          {/* City & District */}
          <div className="addbranch-form-row">
            <div className="addbranch-form-group">
              <label>Shahar</label>
              <CustomDropdown
                value={form.address.city}
                options={cityOptions}
                placeholder={form.address.region ? "Tanlang" : "Avval region tanlang"}
                onChange={val => handleInputChange("address.city", val)}
                disabled={loading || !form.address.region}
              />
            </div>
            <div className="addbranch-form-group">
              <label>Tuman</label>
              <CustomDropdown
                value={form.address.district}
                options={districtOptions}
                placeholder={form.address.city ? "Tanlang" : "Avval shahar tanlang"}
                onChange={val => handleInputChange("address.district", val)}
                disabled={loading || !form.address.city}
              />
            </div>
          </div>

          {/* Street / House */}
          <div className="addbranch-form-row">
            <div className="addbranch-form-group">
              <label>Ko‘cha</label>
              <input
                className="addbranch-map-street"
                type="text"
                value={form.address.street}
                onChange={e => handleInputChange("address.street", e.target.value)}
                disabled={loading}
                maxLength={15}
                placeholder="Bunyodkor"
              />
            </div>
            <div className="addbranch-form-group">
              <label>Uy</label>
              <input
                className="addbranch-map-house"
                type="text"
                value={form.address.house}
                onChange={e => handleInputChange("address.house", e.target.value)}
                disabled={loading}
                maxLength={15}
                placeholder="12"
              />
            </div>
          </div>

          {/* Entrance / Floor */}
          <div className="addbranch-form-row">
            <div className="addbranch-form-group">
              <label>Kirish yo‘lagi</label>
              <input
                className="addbranch-map-entrance"
                type="text"
                value={form.address.entrance}
                onChange={e =>
                  handleInputChange(
                    "address.entrance",
                    e.target.value.replace(/[^0-9a-zA-Z]/g, "")
                  )
                }
                disabled={loading}
                maxLength={15}
                placeholder="1"
                inputMode="text"
              />
            </div>
            <div className="addbranch-form-group">
              <label>Qavat</label>
              <input
                className="addbranch-map-floor"
                type="text"
                value={form.address.floor}
                onChange={e =>
                  handleInputChange(
                    "address.floor",
                    e.target.value.replace(/[^0-9a-zA-Z]/g, "")
                  )
                }
                disabled={loading}
                maxLength={15}
                placeholder="1"
                inputMode="text"
              />
            </div>
          </div>

          {/* Apartment / PlaceId */}
          <div className="addbranch-form-row">
            <div className="addbranch-form-group">
              <label>Xona / Kvartira</label>
              <input
                className="addbranch-map-apartment"
                type="text"
                value={form.address.apartment}
                onChange={e => handleInputChange("address.apartment", e.target.value)}
                disabled={loading}
                maxLength={8}
                placeholder="101"
              />
            </div>
            <div className="addbranch-form-group">
              <label>Place ID</label>
              <input
                className="addbranch-map-placeid"
                type="text"
                value={form.address.placeId}
                onChange={e => handleInputChange("address.placeId", e.target.value)}
                disabled={loading}
                maxLength={64}
                placeholder="Google place id"
              />
            </div>
          </div>

          {/* Comment */}
          <div className="addbranch-form-group">
            <label>Izoh</label>
            <textarea
              className="addbranch-map-comment"
              rows="4"
              value={form.address.comment}
              onChange={e => handleInputChange("address.comment", e.target.value)}
              disabled={loading}
              maxLength={500}
              placeholder="Filial haqida qo‘shimcha ma’lumot..."
            />
          </div>

          {/* Active Switch */}
          <div className="addbranch-switch-row">
            <span>Holat: {form.active ? "Aktiv" : "No aktiv"}</span>
            <button
              type="button"
              className={`addbranch-switch ${form.active ? "active" : ""}`}
              onClick={() => handleInputChange("active", !form.active)}
              disabled={loading}
            >
              <span className="addbranch-switch-thumb" />
            </button>
          </div>

          {/* Buttons Footer */}
          <div className="addbranch-modal-footer">
            <button
              type="button"
              className="addbranch-cancel-btn"
              onClick={handleClose}
              disabled={loading}
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="addbranch-submit-btn"
              disabled={loading}
            >
              {loading ? "Yaratilmoqda..." : "Yaratish"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}