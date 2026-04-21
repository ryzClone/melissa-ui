import React from "react";
import "./productModal.css";

export default function ProductModal({ open, onClose }) {
  if (!open) return null;

  return (
    <div className="pm-overlay">
      <div className="pm-modal">

        <div className="pm-header">
          <div>
            <h2>Yangi mahsulot qo'shish</h2>
            <p>Mahsulot ma'lumotlarini kiriting</p>
          </div>
          <button className="pm-close" onClick={onClose}>✕</button>
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
            <input placeholder="Masalan: Palov"/>
          </div>

          <div className="pm-sku">
            <div className="pm-field">
              <label>SKU</label>
              <input placeholder="PLV-001"/>
            </div>

            <div className="pm-auto">
              <span>Auto</span>
              <label className="pm-switch">
                <input type="checkbox"/>
                <span className="pm-slider"/>
              </label>
            </div>
          </div>


          <h4 className="pm-section">NARX VA ZAXIRA</h4>

          <div className="pm-price-stock">

            <div className="pm-field">
              <label>Narx *</label>
              <div className="pm-price">
                <input defaultValue="0"/>
                <span>so'm</span>
              </div>
            </div>

            <div className="pm-field">
              <label>Zaxira</label>

              <div className="pm-stock">
                <button>-</button>
                <input value="0" readOnly/>
                <button>+</button>
              </div>

              <div className="pm-warning">
                Mahsulot tugagan
              </div>

            </div>

          </div>


          <h4 className="pm-section">TASNIF</h4>

          <div className="pm-field">
            <label>Restoran *</label>
            <select>
              <option>Restoran tanlang</option>
            </select>
          </div>

          <div className="pm-field">
            <label>Kategoriya *</label>
            <select>
              <option>Kategoriya tanlang</option>
            </select>
          </div>

          <div className="pm-field">
            <label>Teglar</label>

            <div className="pm-tags">
              <input placeholder="Yangi teg kiriting..."/>
              <button className="pm-add">+ Qo'shish</button>
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
                <input type="checkbox" defaultChecked/>
                <span className="pm-slider"/>
              </label>
            </div>

          </div>


          <div className="pm-extra">
            ✨ Qo'shimcha sozlamalar
          </div>

        </div>

        <div className="pm-footer">
          <button className="pm-cancel">Bekor qilish</button>
          <button className="pm-save">Saqlash</button>
        </div>

      </div>
    </div>
  );
}