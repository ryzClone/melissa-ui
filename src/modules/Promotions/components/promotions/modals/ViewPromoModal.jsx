import { X } from "lucide-react";
import "./PromotionModals.css";

function Field({ label, value }) {
  return (
    <div className="promo-form-group">
      <label>{label}</label>
      <div className="promo-view-value">
        {value === null || value === undefined || value === ""
          ? "—"
          : String(value)}
      </div>
    </div>
  );
}

const toDisplayDate = (value = "") => {
  if (!value) return "—";
  if (value.includes(".")) return value;
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;
  return `${day}.${month}.${year}`;
};

const formatPromoType = (type = "") => {
  if (type === "PERCENTAGE") return "Foiz (%)";
  if (type === "FIXED_AMOUNT" || type === "FIXED") return "Qiymat (UZS)";
  return type || "—";
};

const formatDiscountValue = (promo = {}) => {
  if (promo.type === "PERCENTAGE") {
    return `${promo.percentageValue ?? 0}%`;
  }

  return `${Number(promo.fixedAmount || 0).toLocaleString("uz-UZ")} UZS`;
};

const formatStatus = (promo = {}) => {
  if (typeof promo.active === "boolean") {
    return promo.active ? "Faol" : "Nofaol";
  }

  if (promo.status) return promo.status;

  return "—";
};

export default function ViewPromoModal({ open, promo, onClose }) {
  if (!open || !promo) return null;

  return (
    <div className="promo-modal-overlay" onClick={onClose}>
      <div className="promo-modal" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="promo-modal-close"
          onClick={onClose}
        >
          <X size={18} />
        </button>

        <div className="promo-modal-top-label">Promokod</div>
        <h2>Promokod ma&apos;lumotlari</h2>
        <p>Tanlangan promokod tafsilotlari</p>

        <div className="promo-form-block">
          <div className="promo-form-title">Asosiy ma&apos;lumotlar</div>

          <div className="promo-form-grid two">
            <Field label="ID" value={promo.id} />
            <Field label="Nomi" value={promo.name} />
            <Field label="Kod" value={promo.code} />
            <Field label="Turi" value={formatPromoType(promo.type)} />
            <Field label="Chegirma" value={formatDiscountValue(promo)} />
            <Field label="Holat" value={formatStatus(promo)} />
          </div>
        </div>

        <div className="promo-form-block">
          <div className="promo-form-title">Shartlar</div>

          <div className="promo-form-grid two">
            <Field label="Min. buyurtma" value={promo.minimumOrderAmount} />
            <Field label="Buyurtmalar soni" value={promo.numberOfOrder} />
            <Field label="Ishlatilgan" value={promo.usageCount} />
          </div>
        </div>

        <div className="promo-form-block">
          <div className="promo-form-title">Amal qilish muddati</div>

          <div className="promo-form-grid two">
            <Field label="Boshlanish" value={toDisplayDate(promo.startDate)} />
            <Field label="Tugash" value={toDisplayDate(promo.endDate)} />
          </div>
        </div>

        <div className="promo-modal-footer promo-modal-footer--single">
          <button type="button" className="promo-cancel-btn" onClick={onClose}>
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
}
