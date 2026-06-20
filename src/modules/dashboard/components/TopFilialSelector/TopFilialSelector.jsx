import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Star } from "lucide-react";
import { usePartner } from "@/context/PartnerContext";
import "./TopFilialSelector.css";

function getPartnerId(partner = {}) {
  return partner.organizationId ?? partner.partnerId ?? partner.id;
}

function getPartnerLabel(partner = {}) {
  const id = getPartnerId(partner);

  return (
    partner.organizationName ||
    partner.name ||
    partner.partnerName ||
    partner.merchantName ||
    partner.code ||
    (id != null ? `Filial #${id}` : "Filial")
  );
}

export function TopFilialStaticCard({ value = "Filial" }) {
  return (
    <div className="top-filial-card top-filial-card--static">
      <div className="top-filial-icon">
        <Star size={18} />
      </div>

      <div className="top-filial-text">
        <span className="top-filial-label">TOP FILIAL</span>
        <strong className="top-filial-value">{value || "Filial"}</strong>
      </div>
    </div>
  );
}

export default function TopFilialSelector() {
  const { partners, partnersLoading, partnerId, setPartnerId } = usePartner();
  const rootRef = useRef(null);
  const [open, setOpen] = useState(false);

  const options = useMemo(
    () =>
      partners
        .map((partner) => {
          const id = getPartnerId(partner);
          if (id == null) return null;

          return {
            label: getPartnerLabel(partner),
            value: String(id),
          };
        })
        .filter(Boolean),
    [partners]
  );

  const selectedOption = options.find(
    (option) => option.value === String(partnerId ?? "")
  );

  const displayValue = selectedOption?.label
    ? selectedOption.label
    : partnersLoading
      ? "Yuklanmoqda..."
      : options.length
        ? "Tashkilotni tanlang"
        : "Tashkilot topilmadi";

  const handleSelect = useCallback(
    (value) => {
      setPartnerId(value);
      setOpen(false);
    },
    [setPartnerId]
  );

  useEffect(() => {
    if (!open) return undefined;

    const handleOutsideClick = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div className="top-filial-selector" ref={rootRef}>
      <button
        type="button"
        className={`top-filial-card top-filial-card--interactive ${
          open ? "is-open" : ""
        }`}
        onClick={() => setOpen((prev) => !prev)}
        disabled={partnersLoading || !options.length}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <div className="top-filial-icon">
          <Star size={18} />
        </div>

        <div className="top-filial-text">
          <span className="top-filial-label">TOP FILIAL</span>
          <strong
            className={`top-filial-value ${
              selectedOption ? "" : "top-filial-value--placeholder"
            }`}
          >
            {displayValue}
          </strong>
        </div>

        <ChevronDown
          size={18}
          className={`top-filial-chevron ${open ? "is-open" : ""}`}
        />
      </button>

      {open && (
        <div className="top-filial-menu" role="listbox">
          {options.map((option) => {
            const isSelected = option.value === String(partnerId ?? "");

            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                className={`top-filial-option ${isSelected ? "is-selected" : ""}`}
                onClick={() => handleSelect(option.value)}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
