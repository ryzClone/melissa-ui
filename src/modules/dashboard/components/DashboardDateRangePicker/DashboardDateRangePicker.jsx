import { useEffect, useRef, useState } from "react";
import { CalendarDays, ChevronDown } from "lucide-react";
import {
  buildDashboardDateParams,
  formatDateRangeLabel,
  getPresetDateRange,
  getTodayDateRange,
  toApiDate,
} from "../../utils/dashboardDateUtils";
import "./DashboardDateRangePicker.css";

const PRESETS = [
  { id: "today", label: "Bugun", getRange: getTodayDateRange },
  { id: "last7", label: "Oxirgi 7 kun", getRange: () => getPresetDateRange("last7") },
  {
    id: "last30",
    label: "Oxirgi 30 kun",
    getRange: () => getPresetDateRange("last30"),
  },
];

export default function DashboardDateRangePicker({ value, onChange }) {
  const wrapRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [draftStart, setDraftStart] = useState(value?.startDate || "");
  const [draftEnd, setDraftEnd] = useState(value?.endDate || "");

  useEffect(() => {
    setDraftStart(value?.startDate || "");
    setDraftEnd(value?.endDate || "");
  }, [value?.startDate, value?.endDate]);

  useEffect(() => {
    if (!open) return undefined;

    const handleOutsideClick = (event) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [open]);

  const applyRange = (range) => {
    if (!range?.startDate || !range?.endDate) return;
    onChange?.(buildDashboardDateParams(range));
    setOpen(false);
  };

  const handlePresetSelect = (preset) => {
    applyRange(preset.getRange());
  };

  const handleApplyCustom = () => {
    if (!draftStart || !draftEnd) return;

    const start = draftStart <= draftEnd ? draftStart : draftEnd;
    const end = draftStart <= draftEnd ? draftEnd : draftStart;

    applyRange({ startDate: start, endDate: end });
  };

  const handleStartChange = (nextStart) => {
    setDraftStart(nextStart);

    if (nextStart && !draftEnd) {
      setDraftEnd(nextStart);
      return;
    }

    if (nextStart && draftEnd && nextStart > draftEnd) {
      setDraftEnd(nextStart);
    }
  };

  return (
    <div className="dashboard-date-wrap" ref={wrapRef}>
      <button
        type="button"
        className={`dashboard-date-trigger ${open ? "active" : ""}`}
        onClick={() => setOpen((prev) => !prev)}
      >
        <CalendarDays size={16} />
        <span>{formatDateRangeLabel(value)}</span>
        <ChevronDown size={14} className={open ? "rotate" : ""} />
      </button>

      {open && (
        <div className="dashboard-date-menu">
          <div className="dashboard-date-presets">
            {PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className="dashboard-date-preset"
                onClick={() => handlePresetSelect(preset)}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="dashboard-date-divider" />

          <div className="dashboard-date-custom">
            <label>
              <span>Boshlanish</span>
              <input
                type="date"
                value={draftStart}
                max={draftEnd || toApiDate(new Date())}
                onChange={(event) => handleStartChange(event.target.value)}
              />
            </label>

            <label>
              <span>Tugash</span>
              <input
                type="date"
                value={draftEnd}
                min={draftStart || undefined}
                max={toApiDate(new Date())}
                onChange={(event) => setDraftEnd(event.target.value)}
              />
            </label>
          </div>

          <button
            type="button"
            className="dashboard-date-apply"
            onClick={handleApplyCustom}
            disabled={!draftStart || !draftEnd}
          >
            Qo'llash
          </button>
        </div>
      )}
    </div>
  );
}
