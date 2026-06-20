import { useEffect, useMemo, useState } from "react";
import {
  Eye,
  Pencil,
  Trash2,
  Check,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import CustomDropdown from "@/components/CustomDropdown/CustomDropdown";
import StatusBadge, {
  formatStatusLabel,
  inferStatusVariant,
  isAutoStatusColumn,
} from "@/components/StatusBadge/StatusBadge";
import "./GlobalTable.css";
import {
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_DROPDOWN_OPTIONS,
  normalizePaginationConfig,
  paginateList,
} from "./tablePagination";

const DEFAULT_ACTION_ICONS = {
  view: Eye,
  edit: Pencil,
  update: Pencil,
  delete: Trash2,
  remove: Trash2,
  success: Check,
  cancel: X,
};

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

const resolveActionVariant = (action) => {
  const raw = (action.variant || action.type || action.className || "edit")
    .toString()
    .toLowerCase()
    .trim();

  if (raw === "update") return "edit";
  if (raw === "remove") return "delete";
  return raw;
};

function TableActions({ actions, row, index }) {
  const visibleActions = actions.filter(
    (action) => typeof action.when !== "function" || action.when(row, index)
  );

  if (visibleActions.length === 0) return "—";

  return (
    <div className="global-table-actions gt-actions">
      {visibleActions.map((action, actionIndex) => {
        const variant = resolveActionVariant(action);
        const Icon = DEFAULT_ACTION_ICONS[variant] || Pencil;
        const iconNode = action.icon ?? <Icon size={16} />;

        return (
          <button
            key={`${variant}-${action.label ?? actionIndex}`}
            type="button"
            className={`global-table-action-btn gt-action-btn ${variant}`}
            title={action.title || action.label}
            onClick={(event) => {
              event.stopPropagation();
              action.onClick?.(row, index);
            }}
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
  const { page, size, totalElements, totalPages } =
    normalizePaginationConfig(pagination);

  const currentPage = Math.min(Math.max(page, 1), totalPages);

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

  const handlePageSizeChange = (nextValue) => {
    const nextSize = Number(nextValue) || DEFAULT_PAGE_SIZE;
    onPageChange?.(1);
    onPageSizeChange?.(nextSize);
  };

  return (
    <div className="global-table-footer gt-footer">
      <div className="global-table-footer-total gt-footer-total">
        <span>Jami: {totalElements} ta</span>
      </div>

      <div className="global-table-pagination gt-pagination">
        <label className="pagination-size gt-page-size">
          <span>Sahifada</span>
          <CustomDropdown
            className="pagination-size-dropdown gt-page-size-dropdown"
            value={String(size)}
            options={PAGE_SIZE_DROPDOWN_OPTIONS}
            onChange={handlePageSizeChange}
            disabled={!onPageSizeChange}
            menuPortal
          />
        </label>

        <button
          type="button"
          className="global-table-page-nav gt-page-nav"
          disabled={currentPage === 1}
          onClick={() => onPageChange?.(currentPage - 1)}
        >
          <ChevronLeft size={14} />
          <span>Oldingi</span>
        </button>

        <div className="global-table-page-list gt-page-list">
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
                className={`global-table-page-btn gt-page-btn ${
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
          className="global-table-page-nav gt-page-nav"
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
        <div className="global-table-actions gt-actions">
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

  if (isAutoStatusColumn(column, value)) {
    const variant =
      typeof column.statusVariant === "function"
        ? column.statusVariant(row, value)
        : inferStatusVariant(value, column.key);

    return (
      <StatusBadge
        variant={variant}
        label={formatStatusLabel(value, column.key)}
      />
    );
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
  showPagination = true,
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
  const isClientPagination = pagination?.client === true;
  const [clientPage, setClientPage] = useState(1);
  const [clientSize, setClientSize] = useState(DEFAULT_PAGE_SIZE);

  useEffect(() => {
    if (!isClientPagination) return;
    setClientPage(1);
  }, [data, isClientPagination]);

  const clientPaginationResult = useMemo(() => {
    if (!isClientPagination) return null;
    return paginateList(data, clientPage, clientSize);
  }, [data, clientPage, clientSize, isClientPagination]);

  const resolvedPagination = isClientPagination
    ? {
        page: clientPaginationResult.page,
        size: clientPaginationResult.size,
        totalElements: clientPaginationResult.totalElements,
        totalPages: clientPaginationResult.totalPages,
      }
    : normalizePaginationConfig(pagination);

  const tableData = isClientPagination
    ? clientPaginationResult.content
    : data;

  const handlePageChange = isClientPagination ? setClientPage : onPageChange;

  const handlePageSizeChange = isClientPagination
    ? (nextSize) => {
        setClientPage(1);
        setClientSize(nextSize);
      }
    : onPageSizeChange;

  const hasActionsColumn = columns.some((column) => column.key === "actions");
  const showActionsColumn =
    hasActionsColumn ||
    actions.length > 0 ||
    typeof renderActions === "function";

  const tableColumns = hasActionsColumn
    ? columns
    : showActionsColumn
      ? [...columns, { key: "actions", title: "Amallar" }]
      : columns;

  const showHeader =
    Boolean(title) ||
    typeof onSearchChange === "function" ||
    Boolean(headerExtra);

  return (
    <div className={`global-table-card gt-wrapper ${className}`.trim()}>
      {showHeader && (
        <div className="global-table-header gt-header">
          {title && <h3 className="global-table-title gt-title">{title}</h3>}

          <div className="global-table-header-tools gt-header-tools">
            {typeof onSearchChange === "function" && (
              <div className="global-table-search gt-search">
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

      <div className="global-table-wrapper gt-scroll global-table-scroll">
        <table className="global-table gt-table global-table-element">
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
                <td
                  colSpan={tableColumns.length}
                  className="global-table-state gt-state"
                >
                  <div className="global-table-loading gt-loading">
                    Yuklanmoqda...
                  </div>
                </td>
              </tr>
            )}

            {!loading && tableData.length === 0 && (
              <tr>
                <td
                  colSpan={tableColumns.length}
                  className="global-table-state gt-state"
                >
                  <div className="global-table-empty gt-empty">{emptyText}</div>
                </td>
              </tr>
            )}

            {!loading &&
              tableData.map((row, index) => (
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
                          ? "global-table-actions-cell gt-actions-col"
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

      {pagination && showPagination && (
        <GlobalTablePagination
          pagination={resolvedPagination}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}
    </div>
  );
}
