import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, X } from "lucide-react";
import "./CustomDropdown.css";

const defaultGetOptionLabel = (option) =>
  option?.label ?? option?.name ?? String(option?.value ?? option?.id ?? "");

const defaultGetOptionValue = (option) =>
  option?.value ?? option?.id ?? option?.label ?? "";

export default function CustomDropdown({
  value,
  options = [],
  onChange,
  placeholder = "Tanlang",
  label,
  disabled = false,
  searchable = false,
  clearable = false,
  getOptionLabel = defaultGetOptionLabel,
  getOptionValue = defaultGetOptionValue,
  className = "",
  startIcon = null,
  menuPortal = true,
}) {
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [menuStyle, setMenuStyle] = useState({});

  const normalizedOptions = useMemo(
    () =>
      options.map((option) => ({
        raw: option,
        label: getOptionLabel(option),
        value: String(getOptionValue(option) ?? ""),
      })),
    [options, getOptionLabel, getOptionValue]
  );

  const selectedOption = normalizedOptions.find(
    (option) => option.value === String(value ?? "")
  );

  const filteredOptions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!searchable || !q) return normalizedOptions;
    return normalizedOptions.filter((option) =>
      option.label.toLowerCase().includes(q)
    );
  }, [normalizedOptions, search, searchable]);

  const updateMenuPosition = useCallback(() => {
    if (!menuPortal || !triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    setMenuStyle({
      position: "fixed",
      top: rect.bottom + 8,
      left: rect.left,
      width: rect.width,
      zIndex: 10000,
    });
  }, [menuPortal]);

  useEffect(() => {
    if (!open || !menuPortal) return undefined;

    updateMenuPosition();

    window.addEventListener("scroll", updateMenuPosition, true);
    window.addEventListener("resize", updateMenuPosition);

    return () => {
      window.removeEventListener("scroll", updateMenuPosition, true);
      window.removeEventListener("resize", updateMenuPosition);
    };
  }, [open, menuPortal, updateMenuPosition]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      const target = event.target;
      if (rootRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setOpen(false);
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleSelect = (nextValue) => {
    onChange?.(nextValue);
    setOpen(false);
    setSearch("");
  };

  const handleClear = (event) => {
    event.stopPropagation();
    onChange?.("");
    setOpen(false);
    setSearch("");
  };

  const menuNode = (
    <div
      ref={menuRef}
      className={`custom-dropdown-menu ${
        menuPortal ? "custom-dropdown-menu--portal" : ""
      }`.trim()}
      style={menuPortal ? menuStyle : undefined}
    >
      {searchable && (
        <div className="custom-dropdown-search-wrap">
          <input
            type="text"
            className="custom-dropdown-search"
            placeholder="Qidirish..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      )}

      <div className="custom-dropdown-options">
        {filteredOptions.length === 0 ? (
          <div className="custom-dropdown-empty">Natija topilmadi</div>
        ) : (
          filteredOptions.map((option) => {
            const isSelected = option.value === String(value ?? "");
            return (
              <button
                key={`${option.value}-${option.label}`}
                type="button"
                className={`custom-dropdown-option ${
                  isSelected ? "selected" : ""
                }`}
                onClick={() => handleSelect(option.value)}
              >
                <span>{option.label}</span>
                {isSelected && <Check size={15} />}
              </button>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <div
      ref={rootRef}
      className={`custom-dropdown ${open ? "open" : ""} ${className}`.trim()}
    >
      {label && <span className="custom-dropdown-label">{label}</span>}

      <button
        ref={triggerRef}
        type="button"
        className="custom-dropdown-trigger"
        disabled={disabled}
        onClick={() => !disabled && setOpen((prev) => !prev)}
      >
        <span className="custom-dropdown-trigger-content">
          {startIcon && (
            <span className="custom-dropdown-start-icon">{startIcon}</span>
          )}
          <span
            className={`custom-dropdown-value ${
              selectedOption ? "" : "placeholder"
            }`}
          >
            {selectedOption?.label || placeholder}
          </span>
        </span>

        <span className="custom-dropdown-actions">
          {clearable && value !== "" && value != null && !disabled && (
            <span
              className="custom-dropdown-clear"
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  handleClear(event);
                }
              }}
            >
              <X size={14} />
            </span>
          )}
          <ChevronDown size={16} className="custom-dropdown-chevron" />
        </span>
      </button>

      {open &&
        (menuPortal ? createPortal(menuNode, document.body) : menuNode)}
    </div>
  );
}
