export function toApiDate(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseApiDate(value) {
  if (!value || typeof value !== "string") return null;

  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;

  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDisplayDate(value) {
  const date = typeof value === "string" ? parseApiDate(value) : value;
  if (!date) return "";

  return new Intl.DateTimeFormat("uz-UZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function getTodayDateRange() {
  const today = toApiDate(new Date());
  return { startDate: today, endDate: today };
}

export function getPresetDateRange(preset) {
  const end = new Date();
  const start = new Date();

  if (preset === "last7") {
    start.setDate(end.getDate() - 6);
  } else if (preset === "last30") {
    start.setDate(end.getDate() - 29);
  }

  return {
    startDate: toApiDate(start),
    endDate: toApiDate(end),
  };
}

export function formatDateRangeLabel({ startDate, endDate }) {
  if (!startDate || !endDate) return "Sana tanlang";

  if (startDate === endDate) {
    return formatDisplayDate(startDate);
  }

  return `${formatDisplayDate(startDate)} — ${formatDisplayDate(endDate)}`;
}

export function buildDashboardDateParams({ startDate, endDate }) {
  const params = {};

  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;

  return params;
}
