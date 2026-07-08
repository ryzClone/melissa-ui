import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";

import {
  LANGUAGE_STORAGE_KEY,
  normalizeLanguageCode,
} from "@/i18n/language";

import "./LanguageDropdown.css";

const LANGUAGES = [
  { code: "en", label: "EN" },
  { code: "ru", label: "RU" },
  { code: "uz", label: "UZ" },
] as const;

type LanguageDropdownProps = {
  className?: string;
  variant?: "fixed" | "inline";
};

export default function LanguageDropdown({
  className = "",
  variant = "fixed",
}: LanguageDropdownProps) {
  const { i18n } = useTranslation();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const currentLanguage = normalizeLanguageCode(i18n.language);
  const selectedLanguage =
    LANGUAGES.find((item) => item.code === currentLanguage) ?? LANGUAGES[0];

  useEffect(() => {
    if (!open) return undefined;

    const handleOutsideClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
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

  const handleToggle = () => {
    setOpen((prev) => !prev);
  };

  const handleSelect = async (code: string) => {
    const nextLanguage = normalizeLanguageCode(code);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
    await i18n.changeLanguage(nextLanguage);
    setOpen(false);
  };

  return (
    <div
      ref={rootRef}
      className={`language-dropdown language-dropdown--${variant} ${
        open ? "is-open" : ""
      } ${className}`.trim()}
    >
      <button
        type="button"
        className="language-dropdown-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={selectedLanguage.label}
        onClick={handleToggle}
      >
        <span className="language-dropdown-code">{selectedLanguage.label}</span>
        <ChevronDown size={14} className="language-dropdown-chevron" />
      </button>

      {open && (
        <div className="language-dropdown-menu" role="listbox">
          {LANGUAGES.map((item) => {
            const isActive = item.code === currentLanguage;

            return (
              <button
                key={item.code}
                type="button"
                role="option"
                aria-selected={isActive}
                className={`language-dropdown-item ${
                  isActive ? "is-active" : ""
                }`.trim()}
                onClick={() => handleSelect(item.code)}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
