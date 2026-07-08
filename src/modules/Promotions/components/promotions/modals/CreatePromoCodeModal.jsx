import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { PROMOTIONS_NAMESPACE } from "@/i18n/namespaces";
import "./CreatePromoCodeModal.css";
import "./PromotionModals.css";

const initialForm = {
  name: "",
  code: "",
  type: "PERCENTAGE",
  percentageValue: "",
  fixedAmount: "",
  numberOfOrder: "1",
  minimumOrderAmount: "",
  startDate: "",
  endDate: "",
  active: true,
};

const generatePromoCode = () => {
  const prefixes = ["WELCOME", "PROMO", "SAVE", "DEAL", "BONUS"];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const number = Math.floor(10 + Math.random() * 90);
  return `${prefix}${number}`;
};

const normalizePromoType = (type) => {
  if (type === "FIXED_AMOUNT" || type === "FIXED") return "FIXED";
  return "PERCENTAGE";
};

const formatDate = (date) => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
};

const parseDate = (value) => {
  if (!value) return null;
  if (value.includes("-")) {
    const [year, month, day] = value.split("-").map(Number);
    if (!year || !month || !day) return null;
    return new Date(year, month - 1, day);
  }
  const [day, month, year] = value.split(".").map(Number);
  if (!day || !month || !year) return null;
  return new Date(year, month - 1, day);
};

const toDisplayDate = (value) => {
  if (!value) return "";
  if (value.includes(".")) return value;
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;
  return `${day}.${month}.${year}`;
};

const toApiDate = (value) => {
  if (!value) return "";
  if (value.includes("-")) return value;
  const [day, month, year] = value.split(".");
  if (!day || !month || !year) return value;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
};

function CustomDatePicker({
  label,
  value,
  pickerName,
  activePicker,
  onOpen,
  onClose,
  onChange,
}) {
  const { t } = useTranslation(PROMOTIONS_NAMESPACE);
  const today = new Date();
  const selectedDate = parseDate(value);
  const [monthOpen, setMonthOpen] = useState(false);
  const [yearOpen, setYearOpen] = useState(false);
  const [viewYear, setViewYear] = useState(
    selectedDate?.getFullYear() || today.getFullYear()
  );
  const [viewMonth, setViewMonth] = useState(
    selectedDate?.getMonth() || today.getMonth()
  );

  const isOpen = activePicker === pickerName;

  useEffect(() => {
    if (!isOpen) return;
    const currentDate = parseDate(value);
    if (currentDate) {
      setViewYear(currentDate.getFullYear());
      setViewMonth(currentDate.getMonth());
    }
  }, [isOpen, value]);

  const days = (() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const lastDay = new Date(viewYear, viewMonth + 1, 0);
    const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    const result = [];
    for (let i = 0; i < startDay; i++) result.push(null);
    for (let day = 1; day <= lastDay.getDate(); day++) {
      result.push(new Date(viewYear, viewMonth, day));
    }
    return result;
  })();

  return (
    <div className="promo-date-wrap">
      <label>{label}</label>
      <button
        type="button"
        className={`promo-date-input ${isOpen ? "active" : ""}`}
        onClick={() => onOpen(pickerName)}
      >
        <CalendarDays size={14} />
        <span>{value || t("form.selectDate")}</span>
      </button>

      {isOpen && (
        <div className="promo-calendar-backdrop" onClick={onClose}>
          <div
            className="promo-calendar-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="promo-calendar-header">
              <strong>{label}</strong>
              <button type="button" onClick={onClose}>
                <X size={15} />
              </button>
            </div>

            <div className="promo-calendar-control">
              <button
                type="button"
                onClick={() => {
                  if (viewMonth === 0) {
                    setViewMonth(11);
                    setViewYear((prev) => prev - 1);
                  } else {
                    setViewMonth((prev) => prev - 1);
                  }
                }}
              >
                <ChevronLeft size={16} />
              </button>

              <div className="promo-calendar-selects">
                <div className="promo-custom-dd">
                  <button
                    type="button"
                    className="promo-dd-btn"
                    onClick={() => {
                      setMonthOpen((prev) => !prev);
                      setYearOpen(false);
                    }}
                  >
                    {t(`calendar.months.${viewMonth}`)}
                  </button>
                  {monthOpen && (
                    <div className="promo-dd-list">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          className={`promo-dd-item ${
                            i === viewMonth ? "active" : ""
                          }`}
                          onClick={() => {
                            setViewMonth(i);
                            setMonthOpen(false);
                          }}
                        >
                          {t(`calendar.months.${i}`)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="promo-custom-dd">
                  <button
                    type="button"
                    className="promo-dd-btn"
                    onClick={() => {
                      setYearOpen((prev) => !prev);
                      setMonthOpen(false);
                    }}
                  >
                    {viewYear}
                  </button>
                  {yearOpen && (
                    <div className="promo-dd-list promo-dd-list-scroll">
                      {Array.from({ length: 20 }).map((_, i) => {
                        const year = 2020 + i;
                        return (
                          <button
                            key={year}
                            type="button"
                            className={`promo-dd-item ${
                              year === viewYear ? "active" : ""
                            }`}
                            onClick={() => {
                              setViewYear(year);
                              setYearOpen(false);
                            }}
                          >
                            {year}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (viewMonth === 11) {
                    setViewMonth(0);
                    setViewYear((prev) => prev + 1);
                  } else {
                    setViewMonth((prev) => prev + 1);
                  }
                }}
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="promo-calendar-weekdays">
              {Array.from({ length: 7 }).map((_, index) => (
                <span key={index}>{t(`calendar.weekdays.${index}`)}</span>
              ))}
            </div>

            <div className="promo-calendar-days">
              {days.map((date, index) => {
                if (!date) return <span key={`empty-${index}`} />;

                const dateValue = formatDate(date);
                const isSelected = value === dateValue;
                const isToday = formatDate(today) === dateValue;

                return (
                  <button
                    key={dateValue}
                    type="button"
                    className={`${isSelected ? "selected" : ""} ${
                      isToday ? "today" : ""
                    }`}
                    onClick={() => {
                      onChange(dateValue);
                      onClose();
                    }}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CreatePromoCodeModal({
  open,
  onClose,
  onSave,
  editData,
}) {
  const { t } = useTranslation(PROMOTIONS_NAMESPACE);
  const [form, setForm] = useState(initialForm);
  const [activePicker, setActivePicker] = useState(null);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!open) return;

    if (editData) {
      const promoType = normalizePromoType(editData.type);

      setForm({
        name: editData.name || "",
        code: editData.code || "",
        type: promoType,
        percentageValue: String(editData.percentageValue ?? ""),
        fixedAmount: String(editData.fixedAmount ?? ""),
        numberOfOrder: String(editData.numberOfOrder ?? "1"),
        minimumOrderAmount: String(editData.minimumOrderAmount ?? ""),
        startDate: toDisplayDate(editData.startDate || ""),
        endDate: toDisplayDate(editData.endDate || ""),
        active: editData.active !== undefined ? Boolean(editData.active) : true,
      });
    } else {
      setForm(initialForm);
    }

    setActivePicker(null);
    setFormError("");
  }, [open, editData]);

  const previewDiscount = useMemo(() => {
    if (form.type === "PERCENTAGE") {
      if (!form.percentageValue) return t("preview.discountZeroPercent");
      return t("preview.discountPercent", { value: form.percentageValue });
    }

    if (!form.fixedAmount) return t("preview.discountZeroFixed");
    return t("preview.discountFixed", {
      value: Number(form.fixedAmount).toLocaleString("uz-UZ"),
    });
  }, [form.type, form.percentageValue, form.fixedAmount, t]);

  if (!open) return null;

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFormError("");
  };

  const handleTypeChange = (type) => {
    setForm((prev) => ({
      ...prev,
      type,
      percentageValue: type === "PERCENTAGE" ? prev.percentageValue : "",
      fixedAmount: type === "FIXED_AMOUNT" ? prev.fixedAmount : "",
    }));
    setFormError("");
  };

  const handleGenerateCode = () => {
    handleChange("code", generatePromoCode());
  };

  const handlePercentageChange = (value) => {
    const cleaned = String(value).replace(/\D/g, "").slice(0, 3);
    setForm((prev) => ({
      ...prev,
      percentageValue: cleaned,
    }));
    setFormError("");
  };

  const handleFixedAmountChange = (value) => {
    const cleaned = String(value).replace(/\D/g, "").slice(0, 6);
    setForm((prev) => ({
      ...prev,
      fixedAmount: cleaned,
    }));
    setFormError("");
  };

  const normalizePercentageValue = () => {
    setForm((prev) => {
      if (!prev.percentageValue) return prev;

      let num = Number(prev.percentageValue);
      if (Number.isNaN(num)) num = 0;
      if (num < 0) num = 0;
      if (num > 100) num = 100;

      return {
        ...prev,
        percentageValue: String(num),
      };
    });
  };

  const normalizeFixedAmount = () => {
    setForm((prev) => {
      if (!prev.fixedAmount) return prev;

      let num = Number(prev.fixedAmount);
      if (Number.isNaN(num) || num < 1000) num = 1000;
      if (num > 100000) num = 100000;

      return {
        ...prev,
        fixedAmount: String(num),
      };
    });
  };

  const validateForm = () => {
    if (!form.name.trim()) return t("validation.promoNameRequired");
    if (!form.code.trim()) return t("validation.promoCodeRequired");
    if (!form.startDate.trim()) return t("validation.startDateRequired");
    if (!form.endDate.trim()) return t("validation.endDateRequired");

    if (form.type === "PERCENTAGE" && form.percentageValue === "") {
      return t("validation.percentRequired");
    }

    if (form.type === "FIXED_AMOUNT" && form.fixedAmount === "") {
      return t("validation.fixedAmountRequired");
    }

    return "";
  };

  const handleSubmit = () => {
    const error = validateForm();
    if (error) {
      setFormError(error);
      return;
    }

    const payload = {
      type: form.type,
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
      numberOfOrder: Number(form.numberOfOrder) || 1,
      minimumOrderAmount: Number(form.minimumOrderAmount) || 0,
      startDate: toApiDate(form.startDate),
      endDate: toApiDate(form.endDate),
      active: Boolean(form.active),
    };

    if (form.type === "PERCENTAGE") {
      payload.percentageValue = Number(form.percentageValue) || 0;
    }

    if (form.type === "FIXED_AMOUNT") {
      payload.fixedAmount = Number(form.fixedAmount) || 0;
    }

    onSave?.(payload);
  };

  return (
    <div className="promo-code-overlay" onClick={onClose}>
      <div
        className="promo-code-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="promo-code-close"
          onClick={onClose}
          aria-label={t("buttons.close")}
        >
          <X size={16} />
        </button>

        <div className="promo-code-head">
          <span>{t("modal.labelPromoCode")}</span>
          <h2>{editData ? t("modal.editPromoCode") : t("modal.createPromoCode")}</h2>
          <p>
            {editData
              ? t("modal.editPromoCodeSubtitle")
              : t("modal.createPromoCodeSubtitle")}
          </p>
        </div>

        <div className="promo-preview-card">
          <div className="promo-preview-top">
            <span>{t("form.preview")}</span>
            <button type="button" aria-hidden="true" tabIndex={-1}>
              <Sparkles size={14} />
            </button>
          </div>
          <div className="promo-preview-code">
            <span />
            {form.code.trim().toUpperCase() || t("form.previewPlaceholder")}
          </div>
          <p>{previewDiscount}</p>
        </div>

        <div className="promo-section">
          <div className="promo-section-title">{t("form.basicInfo")}</div>

          <div className="promo-field">
            <label>{t("form.promoCodeName")}</label>
            <input
              type="text"
              placeholder={t("form.placeholders.promoCodeName")}
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </div>

          <div className="promo-field">
            <label>{t("form.promoCodeCode")}</label>
            <div className="promo-code-row">
              <input
                type="text"
                placeholder={t("form.placeholders.promoCodeCode")}
                value={form.code}
                onChange={(e) =>
                  handleChange("code", e.target.value.toUpperCase())
                }
              />
              <button type="button" onClick={handleGenerateCode}>
                {t("buttons.generate")}
              </button>
            </div>
          </div>

          <div className="promo-field">
            <label>{t("form.discountType")}</label>
            <div className="promo-type-tabs">
              <button
                type="button"
                className={form.type === "PERCENTAGE" ? "active" : ""}
                onClick={() => handleTypeChange("PERCENTAGE")}
              >
                {t("form.typePercentage")}
              </button>
              <button
                type="button"
                className={form.type === "FIXED_AMOUNT" ? "active" : ""}
                onClick={() => handleTypeChange("FIXED_AMOUNT")}
              >
                {t("form.typeFixed")}
              </button>
            </div>
          </div>

          {form.type === "PERCENTAGE" ? (
            <div className="promo-field">
              <label>{t("form.percentValue")}</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder={t("form.placeholders.percent")}
                value={form.percentageValue}
                onChange={(e) => handlePercentageChange(e.target.value)}
                onBlur={normalizePercentageValue}
              />
            </div>
          ) : (
            <div className="promo-field">
              <label>{t("form.fixedAmount")}</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder={t("form.placeholders.fixedAmount")}
                value={form.fixedAmount}
                onChange={(e) => handleFixedAmountChange(e.target.value)}
                onBlur={normalizeFixedAmount}
              />
            </div>
          )}

          <div className="promo-two-grid">
            <div className="promo-field">
              <label>{t("form.orderCount")}</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder={t("form.placeholders.orderCount")}
                value={form.numberOfOrder}
                onChange={(e) =>
                  handleChange(
                    "numberOfOrder",
                    e.target.value.replace(/\D/g, "").slice(0, 5)
                  )
                }
              />
            </div>

            <div className="promo-field">
              <label>{t("form.minOrder")}</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder={t("form.placeholders.minOrder")}
                value={form.minimumOrderAmount}
                onChange={(e) =>
                  handleChange(
                    "minimumOrderAmount",
                    e.target.value.replace(/\D/g, "").slice(0, 9)
                  )
                }
              />
            </div>
          </div>

        </div>

        <div className="promo-section">
          <div className="promo-section-title">{t("form.validityPeriod")}</div>
          <div className="promo-two-grid">
            <CustomDatePicker
              label={t("form.startDate")}
              value={form.startDate}
              pickerName="startDate"
              activePicker={activePicker}
              onOpen={setActivePicker}
              onClose={() => setActivePicker(null)}
              onChange={(value) => handleChange("startDate", value)}
            />
            <CustomDatePicker
              label={t("form.endDate")}
              value={form.endDate}
              pickerName="endDate"
              activePicker={activePicker}
              onOpen={setActivePicker}
              onClose={() => setActivePicker(null)}
              onChange={(value) => handleChange("endDate", value)}
            />
          </div>
        </div>

        <div className="promo-section">
          <div className="promo-status-row">
            <div>
              <h4>{t("form.activateNow")}</h4>
              <p>{t("form.activatePromoNowHint")}</p>
            </div>
            <label className="promo-switch">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => handleChange("active", e.target.checked)}
              />
              <span />
            </label>
          </div>
        </div>

        {formError && (
          <p
            style={{
              marginTop: 12,
              color: "#f87171",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {formError}
          </p>
        )}

        <div className="promo-footer">
          <button type="button" className="promo-cancel" onClick={onClose}>
            {t("buttons.cancel")}
          </button>
          <button type="button" className="promo-submit" onClick={handleSubmit}>
            {editData ? t("buttons.save") : t("buttons.createPromoCode")}
          </button>
        </div>
      </div>
    </div>
  );
}
