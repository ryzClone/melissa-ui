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

const toDisplayDate = (value = "") => {
  if (!value) return "—";
  if (value.includes(".")) return value;
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;
  return `${day}.${month}.${year}`;
};

export default function ViewPromoModal({ open, promo, onClose }) {
  const { t } = useTranslation(PROMOTIONS_NAMESPACE);

  if (!open || !promo) return null;

  const formatPromoType = (type = "") => {
    if (type === "PERCENTAGE") return t("types.percentageFull");
    if (type === "FIXED_AMOUNT" || type === "FIXED") return t("types.fixedFull");
    return type || "—";
  };

  const formatDiscountValue = (item = {}) => {
    if (item.type === "PERCENTAGE") {
      return `${item.percentageValue ?? 0}%`;
    }

    return `${Number(item.fixedAmount || 0).toLocaleString("uz-UZ")} UZS`;
  };

  const formatStatus = (item = {}) => {
    if (typeof item.active === "boolean") {
      return item.active ? t("status.active") : t("status.inactive");
    }

    if (item.status) return item.status;

    return "—";
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

        <div className="promo-modal-top-label">{t("modal.labelPromoCodeSingle")}</div>
        <h2>{t("modal.viewPromoCode")}</h2>
        <p>{t("modal.viewPromoCodeSubtitle")}</p>

        <div className="promo-form-block">
          <div className="promo-form-title">{t("form.basicInfo")}</div>

          <div className="promo-form-grid two">
            <Field label={t("table.id")} value={promo.id} />
            <Field label={t("table.name")} value={promo.name} />
            <Field label={t("table.code")} value={promo.code} />
            <Field label={t("table.type")} value={formatPromoType(promo.type)} />
            <Field label={t("table.discount")} value={formatDiscountValue(promo)} />
            <Field label={t("table.status")} value={formatStatus(promo)} />
          </div>
        </div>

        <div className="promo-form-block">
          <div className="promo-form-title">{t("form.conditions")}</div>

          <div className="promo-form-grid two">
            <Field label={t("table.minOrder")} value={promo.minimumOrderAmount} />
            <Field label={t("table.orderCount")} value={promo.numberOfOrder} />
            <Field label={t("table.usageCount")} value={promo.usageCount} />
          </div>
        </div>

        <div className="promo-form-block">
          <div className="promo-form-title">{t("form.validityPeriod")}</div>

          <div className="promo-form-grid two">
            <Field label={t("table.startDate")} value={toDisplayDate(promo.startDate)} />
            <Field label={t("table.endDate")} value={toDisplayDate(promo.endDate)} />
          </div>
        </div>

        <div className="promo-modal-footer promo-modal-footer--single">
          <button type="button" className="promo-cancel-btn" onClick={onClose}>
            {t("buttons.close")}
          </button>
        </div>
      </div>
    </div>
  );
}
