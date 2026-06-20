import "./StatusBadge.css";

const STATUS_VARIANTS = new Set([
  "active",
  "inactive",
  "success",
  "warning",
  "danger",
  "info",
  "new",
  "accepted",
  "cooking",
  "done",
  "pending",
]);

const STATUS_COLUMN_KEYS = new Set([
  "status",
  "active",
  "isActive",
  "enabled",
  "isEnabled",
]);

export function formatStatusLabel(value, columnKey) {
  if (value === null || value === undefined || value === "") return "—";

  if (typeof value === "boolean") {
    if (columnKey === "active") return value ? "Faol" : "Nofaol";
    return value ? "Ha" : "Yo'q";
  }

  const normalized = String(value).toLowerCase();

  if (normalized === "true" || normalized === "active") return "Faol";
  if (normalized === "false" || normalized === "inactive") return "Nofaol";

  return String(value);
}

export function inferStatusVariant(value, columnKey = "") {
  if (typeof value === "boolean") {
    return value ? "active" : "inactive";
  }

  const normalized = String(value ?? "").toLowerCase().trim();

  if (
    ["new"].includes(normalized) ||
    normalized.includes("yangi")
  ) {
    return "new";
  }

  if (
    ["accepted", "qabul"].includes(normalized) ||
    normalized.includes("qabul")
  ) {
    return "accepted";
  }

  if (
    ["cooking", "process", "processing", "jarayon"].includes(normalized) ||
    normalized.includes("cooking") ||
    normalized.includes("jarayon")
  ) {
    return "cooking";
  }

  if (
    ["done", "ready", "completed", "complete", "tayyor", "yopildi"].includes(
      normalized
    ) ||
    normalized.includes("tayyor") ||
    normalized.includes("bajar")
  ) {
    return "done";
  }

  if (
    [
      "true",
      "active",
      "faol",
      "aktiv",
      "tasdiqlandi",
      "confirmed",
      "success",
    ].includes(normalized) ||
    normalized.includes("faol") ||
    normalized.includes("aktiv") ||
    normalized.includes("tasdiq")
  ) {
    return "active";
  }

  if (
    [
      "false",
      "inactive",
      "nofaol",
      "bekor",
      "cancelled",
      "canceled",
      "cancel",
      "danger",
    ].includes(normalized) ||
    normalized.includes("bekor") ||
    normalized.includes("nofaol")
  ) {
    return "inactive";
  }

  if (
    ["pending", "kutilmoqda", "warning", "waiting"].includes(normalized) ||
    normalized.includes("kutil")
  ) {
    return "warning";
  }

  if (normalized.includes("info")) return "info";

  if (columnKey === "active") return "inactive";

  return "pending";
}

export function isAutoStatusColumn(column, value) {
  if (column?.statusBadge === false) return false;
  if (column?.statusBadge === true) return true;
  if (column?.render) return false;
  if (column?.key === "actions") return false;
  if (STATUS_COLUMN_KEYS.has(column?.key)) return true;
  if (typeof value === "boolean") return true;
  return false;
}

export default function StatusBadge({
  variant = "pending",
  label,
  children,
  className = "",
}) {
  const safeVariant = STATUS_VARIANTS.has(variant) ? variant : "pending";

  return (
    <span
      className={`status-badge status-badge--${safeVariant} ${className}`.trim()}
    >
      {children ?? label ?? "—"}
    </span>
  );
}
