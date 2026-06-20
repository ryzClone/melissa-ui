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

function resolveProductLabel(item = {}) {
  const raw = item.raw || {};
  const name =
    raw.productName ||
    raw.product?.name ||
    item.productName ||
    "";

  if (name) return name;

  const productId = raw.productId ?? item.productId;
  if (productId != null && productId !== "") {
    return String(productId);
  }

  return "—";
}

export default function ViewDiscountModal({ open, discount, onClose }) {
  if (!open || !discount) return null;

  const raw = discount.raw || {};

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

        <div className="promo-modal-top-label">Aksiya</div>
        <h2>Aksiya ma&apos;lumotlari</h2>
        <p>Tanlangan aksiya tafsilotlari</p>

        <div className="promo-form-block">
          <div className="promo-form-title">Asosiy ma&apos;lumotlar</div>

          <div className="promo-form-grid two">
            <Field label="Nomi" value={discount.name} />
            <Field label="Kod" value={discount.code} />
            <Field label="Turi" value={discount.type} />
            <Field
              label="Chegirma"
              value={discount.discount ?? discount.value}
            />
            <Field label="Mahsulot" value={resolveProductLabel(discount)} />
            <Field label="Holat" value={discount.status} />
          </div>
        </div>

        <div className="promo-form-block">
          <div className="promo-form-title">Amal qilish muddati</div>

          <div className="promo-form-grid two">
            <Field label="Boshlanish" value={discount.startDate} />
            <Field label="Tugash" value={discount.endDate} />
          </div>
        </div>

        {raw.description ? (
          <div className="promo-form-block">
            <div className="promo-form-title">Qo&apos;shimcha</div>
            <Field label="Izoh" value={raw.description} />
          </div>
        ) : null}

        <div className="promo-modal-footer promo-modal-footer--single">
          <button type="button" className="promo-cancel-btn" onClick={onClose}>
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
}
