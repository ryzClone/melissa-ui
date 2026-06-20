import { useState } from "react";
import CustomDropdown from "@/components/CustomDropdown/CustomDropdown";
import "./productModal.css";

const RESTAURANT_OPTIONS = [
  { label: "Restoran tanlang", value: "" },
  { label: "Osh Markazi", value: "osh-markazi" },
  { label: "Samarqand", value: "samarqand" },
];

const CATEGORY_OPTIONS = [
  { label: "Kategoriya tanlang", value: "" },
  { label: "Asosiy taomlar", value: "main" },
  { label: "Ichimliklar", value: "drinks" },
];

export default function ProductModal({ open, onClose }) {
  const [restaurant, setRestaurant] = useState("");
  const [category, setCategory] = useState("");

  if (!open) return null;

  return (
    <div className="pm-overlay">
      <div className="pm-modal">
        <div className="pm-header">
          <div>
            <h2>Yangi mahsulot qo'shish</h2>
            <p>Mahsulot ma'lumotlarini kiriting</p>
          </div>
          <button className="pm-close" onClick={onClose} type="button">
            ✕
          </button>
        </div>

        <div className="pm-body">
          <h4 className="pm-section">ASOSIY MA'LUMOTLAR</h4>

          <label className="pm-label">Mahsulot rasmi</label>

          <div className="pm-upload">
            <div className="pm-upload-icon">⬆</div>
            <div>Rasm yuklang yoki tashlang</div>
            <small>PNG, JPG, WEBP (maks. 5MB)</small>
          </div>

          <div className="pm-field">
            <label>Mahsulot nomi *</label>
            <input placeholder="Masalan: Palov" />
          </div>

          <div className="pm-sku">
            <div className="pm-field">
              <label>SKU</label>
              <input placeholder="PLV-001" />
            </div>

            <div className="pm-auto">
              <span>Auto</span>
              <label className="pm-switch">
                <input type="checkbox" />
                <span className="pm-slider" />
              </label>
            </div>
          </div>

          <h4 className="pm-section">NARX VA ZAXIRA</h4>

          <div className="pm-price-stock">
            <div className="pm-field">
              <label>Narx *</label>
              <div className="pm-price">
                <input defaultValue="0" />
                <span>so'm</span>
              </div>
            </div>

            <div className="pm-field">
              <label>Zaxira</label>

              <div className="pm-stock">
                <button type="button">-</button>
                <input value="0" readOnly />
                <button type="button">+</button>
              </div>

              <div className="pm-warning">Mahsulot tugagan</div>
            </div>
          </div>

          <h4 className="pm-section">TASNIF</h4>

          <div className="pm-field">
            <label>Restoran *</label>
            <CustomDropdown
              value={restaurant}
              onChange={setRestaurant}
              placeholder="Restoran tanlang"
              options={RESTAURANT_OPTIONS}
            />
          </div>

          <div className="pm-field">
            <label>Kategoriya *</label>
            <CustomDropdown
              value={category}
              onChange={setCategory}
              placeholder="Kategoriya tanlang"
              options={CATEGORY_OPTIONS}
            />
          </div>

          <div className="pm-field">
            <label>Teglar</label>

            <div className="pm-tags">
              <input placeholder="Yangi teg kiriting..." />
              <button className="pm-add" type="button">
                + Qo'shish
              </button>
            </div>
          </div>

          <h4 className="pm-section">HOLAT</h4>

          <div className="pm-status">
            <div>
              <div className="pm-status-title">Mahsulot holati</div>
              <small>Mahsulot faol</small>
            </div>

            <div className="pm-status-right">
              <span>Faol</span>
              <label className="pm-switch">
                <input type="checkbox" defaultChecked />
                <span className="pm-slider" />
              </label>
            </div>
          </div>

          <div className="pm-extra">✨ Qo'shimcha sozlamalar</div>
        </div>

        <div className="pm-footer">
          <button className="pm-cancel" type="button">
            Bekor qilish
          </button>
          <button className="pm-save" type="button">
            Saqlash
          </button>
        </div>
      </div>
    </div>
  );
}
