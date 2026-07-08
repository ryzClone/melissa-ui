import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PROMOTIONS_NAMESPACE } from "@/i18n/namespaces";
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
  const { t } = useTranslation(PROMOTIONS_NAMESPACE);

  if (!open || !discount) return null;

  const raw = discount.raw || {};

  const resolveTypeLabel = () => {
    const rawType = raw.type ?? discount.type;
    if (rawType === "PERCENTAGE") return t("types.percentage");
    if (rawType === "FIXED" || rawType === "FIXED_AMOUNT") return t("types.fixed");
    return discount.type || "—";
  };

  const resolveStatusLabel = () => {
    if (typeof discount.active === "boolean") {
      return discount.active ? t("status.active") : t("status.inactive");
    }
    if (discount.status === "Faol") return t("status.active");
    if (discount.status === "Nofaol") return t("status.inactive");
    if (discount.status === "Kutilmoqda") return t("status.pending");
    return discount.status || "—";
  };

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

        <div className="promo-modal-top-label">{t("modal.labelPromotion")}</div>
        <h2>{t("modal.view")}</h2>
        <p>{t("modal.viewSubtitle")}</p>

        <div className="promo-form-block">
          <div className="promo-form-title">{t("form.basicInfo")}</div>

          <div className="promo-form-grid two">
            <Field label={t("table.name")} value={discount.name} />
            <Field label={t("table.code")} value={discount.code} />
            <Field label={t("table.type")} value={resolveTypeLabel()} />
            <Field
              label={t("table.discount")}
              value={discount.discount ?? discount.value}
            />
            <Field label={t("table.product")} value={resolveProductLabel(discount)} />
            <Field label={t("table.status")} value={resolveStatusLabel()} />
          </div>
        </div>

        <div className="promo-form-block">
          <div className="promo-form-title">{t("form.validityPeriod")}</div>

          <div className="promo-form-grid two">
            <Field label={t("table.startDate")} value={discount.startDate} />
            <Field label={t("table.endDate")} value={discount.endDate} />
          </div>
        </div>

        {raw.description ? (
          <div className="promo-form-block">
            <div className="promo-form-title">{t("form.additional")}</div>
            <Field label={t("form.description")} value={raw.description} />
          </div>
        ) : null}

        <div className="promo-modal-footer promo-modal-footer--single">
          <button type="button" className="promo-cancel-btn" onClick={onClose}>
            {t("buttons.close")}
          </button>
        </div>
      </div>
    </div>
  );
}
