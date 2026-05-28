import {
  Eye,
  Pencil,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import "./GlobalTable.css";

const ACTION_ICONS = {
  view: Eye,
  edit: Pencil,
  update: Pencil,
  delete: Trash2,
  remove: Trash2,
};

const STATUS_COLUMN_KEYS = new Set([
  "status",
  "active",
  "isActive",
  "enabled",
  "isEnabled",
]);

const getColumnLabel = (column) => column.label ?? column.title ?? column.key;

const getRowKey = (row, index, rowKey) => {
  if (typeof rowKey === "function") return rowKey(row, index);
  if (rowKey && row[rowKey] != null) return String(row[rowKey]);
  return `row-${index}`;
};

const getNestedValue = (row, key) => {
  if (!key || !row) return undefined;
  if (key.includes(".")) {
    return key.split(".").reduce((acc, part) => acc?.[part], row);
  }
  return row[key];
};

const isStatusColumn = (column, value) => {
  if (column.key === "actions") return false;
  if (column.render) return false;
  if (STATUS_COLUMN_KEYS.has(column.key)) return true;
  if (typeof value === "boolean") return true;
  if (value === "active" || value === "inactive") return true;
  const normalized = String(value ?? "").toLowerCase();
  return normalized === "true" || normalized === "false";
};

const getStatusBadgeClass = (value) => {
  if (typeof value === "boolean") {
    return value ? "gt-badge-active" : "gt-badge-inactive";
  }

  const normalized = String(value ?? "").toLowerCase();

  if (
    [
      "true",
      "active",
      "faol",
      "aktiv",
      "tasdiqlandi",
      "tayyor",
      "confirmed",
      "completed",
      "yopildi",
    ].includes(normalized) ||
    normalized.includes("faol") ||
    normalized.includes("aktiv") ||
    normalized.includes("tasdiq")
  ) {
    return "gt-badge-active";
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
    ].includes(normalized) ||
    normalized.includes("bekor") ||
    normalized.includes("nofaol")
  ) {
    return "gt-badge-inactive";
  }

  return "gt-badge-pending";
};

const formatStatusLabel = (value, key) => {
  if (typeof value === "boolean") {
    if (key === "active") return value ? "Faol" : "Nofaol";
    return value ? "Ha" : "Yo'q";
  }

  const normalized = String(value ?? "").toLowerCase();
  if (normalized === "true" || normalized === "active") return "Faol";
  if (normalized === "false" || normalized === "inactive") return "Nofaol";

  return value ?? "—";
};

function StatusBadge({ value, columnKey }) {
  return (
    <span className={`gt-badge ${getStatusBadgeClass(value)}`}>
      {formatStatusLabel(value, columnKey)}
    </span>
  );
}

function resolveActionType(action) {
  const raw = (action.type || action.className || "edit")
    .toString()
    .toLowerCase()
    .trim();

  if (raw === "update") return "edit";
  if (raw === "remove") return "delete";
  return raw;
}

function TableActions({ actions, row, index }) {
  return (
    <div className="gt-actions">
      {actions.map((action, actionIndex) => {
        const type = resolveActionType(action);
        const Icon = ACTION_ICONS[type] || Pencil;
        const iconNode = action.icon ?? <Icon size={16} />;

        return (
          <button
            key={`${type}-${action.label ?? action.title ?? actionIndex}`}
            type="button"
            className={`gt-action-btn gt-action-${type} global-table-action-btn ${type}`}
            title={action.title || action.label}
            onClick={() => action.onClick?.(row, index)}
          >
            {iconNode}
          </button>
        );
      })}
    </div>
  );
}

function GlobalTablePagination({
  pagination,
  onPageChange,
  onPageSizeChange,
}) {
  const {
    page = 1,
    pageSize = 10,
    total = 0,
    pageSizeOptions = [10, 20, 50],
  } = pagination;

  const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const start = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = total === 0 ? 0 : Math.min(currentPage * pageSize, total);

  const pages = [];
  if (totalPages <= 6) {
    for (let i = 1; i <= totalPages; i += 1) pages.push(i);
  } else {
    if (currentPage > 3) pages.push(1, "...");
    for (let i = currentPage - 1; i <= currentPage + 1; i += 1) {
      if (i > 0 && i <= totalPages) pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("...", totalPages);
  }

  return (
    <div className="gt-footer global-table-footer">
      <div className="gt-footer-info global-table-footer-info">
        <span>
          {total === 0
            ? "0 ta yozuv"
            : `${start}–${end} / ${total} ta yozuv`}
        </span>
        {onPageSizeChange && (
          <label className="gt-page-size global-table-page-size">
            <span>Sahifada</span>
            <select
              value={pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <div className="gt-pagination global-table-pagination">
        <button
          type="button"
          className="gt-page-nav global-table-page-nav"
          disabled={currentPage === 1}
          onClick={() => onPageChange?.(currentPage - 1)}
        >
          <ChevronLeft size={14} />
          <span>Oldingi</span>
        </button>

        <div className="gt-page-list global-table-page-list">
          {pages.map((pageNumber, index) =>
            pageNumber === "..." ? (
              <span
                key={`ellipsis-${index}`}
                className="gt-page-ellipsis global-table-page-ellipsis"
              >
                ...
              </span>
            ) : (
              <button
                key={`page-${pageNumber}`}
                type="button"
                className={`gt-page-btn global-table-page-btn ${
                  currentPage === pageNumber ? "active" : ""
                }`}
                onClick={() => onPageChange?.(pageNumber)}
              >
                {pageNumber}
              </button>
            )
          )}
        </div>

        <button
          type="button"
          className="gt-page-nav global-table-page-nav"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange?.(currentPage + 1)}
        >
          <span>Keyingi</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

function renderCell(column, row, index, actions, renderActions) {
  if (column.key === "actions") {
    if (typeof renderActions === "function") {
      return (
        <div className="gt-actions global-table-actions">
          {renderActions(row, index)}
        </div>
      );
    }
    if (actions.length > 0) {
      return <TableActions actions={actions} row={row} index={index} />;
    }
    return "—";
  }

  if (typeof column.render === "function") {
    return column.render(row, index);
  }

  const value = getNestedValue(row, column.key);

  if (isStatusColumn(column, value)) {
    return <StatusBadge value={value} columnKey={column.key} />;
  }

  if (value === null || value === undefined || value === "") {
    return "—";
  }

  return value;
}

export default function GlobalTable({
  title,
  columns = [],
  data = [],
  actions = [],
  loading = false,
  emptyText = "Ma'lumot topilmadi",
  pagination,
  onPageChange,
  onPageSizeChange,
  rowKey = "id",
  className = "",
  renderActions,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Qidiruv...",
  headerExtra,
  onRowClick,
  onRowDoubleClick,
}) {
  const hasActionsColumn = columns.some((column) => column.key === "actions");
  const showActionsColumn =
    hasActionsColumn ||
    actions.length > 0 ||
    typeof renderActions === "function";

  const tableColumns = hasActionsColumn
    ? columns
    : showActionsColumn
      ? [...columns, { key: "actions", label: "Amallar" }]
      : columns;

  const showHeader =
    Boolean(title) ||
    typeof onSearchChange === "function" ||
    Boolean(headerExtra);

  return (
    <div className={`gt-wrapper global-table ${className}`.trim()}>
      {showHeader && (
        <div className="gt-header global-table-header">
          {title && <h3 className="gt-title global-table-title">{title}</h3>}

          <div className="gt-header-tools global-table-header-tools">
            {typeof onSearchChange === "function" && (
              <div className="gt-search global-table-search">
                <Search size={16} />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchValue ?? ""}
                  onChange={(event) => onSearchChange(event.target.value)}
                />
              </div>
            )}
            {headerExtra}
          </div>
        </div>
      )}

      <div className="gt-scroll global-table-scroll">
        <table className="gt-table global-table-element">
          <thead>
            <tr>
              {tableColumns.map((column) => (
                <th
                  key={column.key}
                  style={{
                    width: column.width,
                    minWidth: column.minWidth,
                    textAlign: column.align || "left",
                  }}
                >
                  {column.header ?? getColumnLabel(column)}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={tableColumns.length} className="gt-state global-table-state">
                  <div className="gt-loading global-table-loading">
                    Yuklanmoqda...
                  </div>
                </td>
              </tr>
            )}

            {!loading && data.length === 0 && (
              <tr>
                <td colSpan={tableColumns.length} className="gt-state global-table-state">
                  <div className="gt-empty global-table-empty">{emptyText}</div>
                </td>
              </tr>
            )}

            {!loading &&
              data.map((row, index) => (
                <tr
                  key={getRowKey(row, index, rowKey)}
                  onClick={
                    onRowClick ? () => onRowClick(row, index) : undefined
                  }
                  onDoubleClick={
                    onRowDoubleClick
                      ? () => onRowDoubleClick(row, index)
                      : undefined
                  }
                  className={
                    onRowClick || onRowDoubleClick
                      ? "gt-row-clickable"
                      : undefined
                  }
                >
                  {tableColumns.map((column) => (
                    <td
                      key={column.key}
                      style={{ textAlign: column.align || "left" }}
                      className={[
                        column.className,
                        column.key === "actions"
                          ? "gt-actions-col global-table-actions-cell"
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      {renderCell(column, row, index, actions, renderActions)}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {pagination && (
        <GlobalTablePagination
          pagination={pagination}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </div>
  );
}
