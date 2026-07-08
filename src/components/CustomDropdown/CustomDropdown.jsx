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
  multiple = false,
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

  const selectedValues = useMemo(() => {
    if (!multiple) return [];

    if (Array.isArray(value)) {
      return value.map((item) => String(item));
    }

    if (value == null || value === "") return [];
    return [String(value)];
  }, [multiple, value]);

  const selectedOption = multiple
    ? null
    : normalizedOptions.find((option) => option.value === String(value ?? ""));

  const selectedChips = useMemo(() => {
    if (!multiple || selectedValues.length === 0) return [];

    return selectedValues.map((selectedValue) => {
      const option = normalizedOptions.find(
        (item) => item.value === selectedValue
      );

      return {
        value: selectedValue,
        label: option?.label || selectedValue,
      };
    });
  }, [multiple, normalizedOptions, selectedValues]);

  const displayLabel = selectedOption?.label || placeholder;

  const hasSelection = multiple
    ? selectedValues.length > 0
    : value !== "" && value != null;

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
    if (multiple) {
      const nextSet = new Set(selectedValues);
      if (nextSet.has(nextValue)) {
        nextSet.delete(nextValue);
      } else {
        nextSet.add(nextValue);
      }
      onChange?.(Array.from(nextSet));
      return;
    }

    onChange?.(nextValue);
    setOpen(false);
    setSearch("");
  };

  const handleClear = (event) => {
    event.preventDefault();
    event.stopPropagation();
    onChange?.(multiple ? [] : "");
    setOpen(false);
    setSearch("");
  };

  const handleRemoveChip = (event, valueToRemove) => {
    event.preventDefault();
    event.stopPropagation();
    onChange?.(selectedValues.filter((item) => item !== valueToRemove));
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
            const isSelected = multiple
              ? selectedValues.includes(option.value)
              : option.value === String(value ?? "");

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
      className={`custom-dropdown ${open ? "open" : ""} ${
        multiple ? "custom-dropdown--multiple" : ""
      } ${className}`.trim()}
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

          {multiple ? (
            selectedChips.length > 0 ? (
              <span className="custom-dropdown-chips">
                {selectedChips.map((chip) => (
                  <span key={chip.value} className="custom-dropdown-chip">
                    <span className="custom-dropdown-chip-label">
                      {chip.label}
                    </span>
                    {!disabled && (
                      <button
                        type="button"
                        className="custom-dropdown-chip-remove"
                        aria-label={`${chip.label} ni olib tashlash`}
                        onMouseDown={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                        }}
                        onClick={(event) => handleRemoveChip(event, chip.value)}
                      >
                        <X size={12} />
                      </button>
                    )}
                  </span>
                ))}
              </span>
            ) : (
              <span className="custom-dropdown-value placeholder">
                {placeholder}
              </span>
            )
          ) : (
            <span
              className={`custom-dropdown-value ${
                hasSelection ? "" : "placeholder"
              }`}
            >
              {displayLabel}
            </span>
          )}
        </span>

        <span className="custom-dropdown-actions">
          {clearable && hasSelection && !disabled && (
            <button
              type="button"
              className="custom-dropdown-clear"
              aria-label="Tanlovni tozalash"
              onMouseDown={(event) => {
                event.preventDefault();
                event.stopPropagation();
              }}
              onClick={handleClear}
            >
              <X size={14} />
            </button>
          )}
          <ChevronDown size={16} className="custom-dropdown-chevron" />
        </span>
      </button>

      {open &&
        (menuPortal ? createPortal(menuNode, document.body) : menuNode)}
    </div>
  );
}
