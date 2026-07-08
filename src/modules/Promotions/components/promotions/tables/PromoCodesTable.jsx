import { useMemo } from "react";
import { Download, Eye, Pencil, Search, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import GlobalTable from "@/components/GlobalTable/GlobalTable";
import StatusBadge, { inferStatusVariant } from "@/components/StatusBadge/StatusBadge";
import { PROMOTIONS_NAMESPACE } from "@/i18n/namespaces";
import "./PromotionsTable.css";

export default function PromoCodesTable({
  items = [],
  loading = false,
  onView,
  onEdit,
  onDelete,
  readOnly = false,
  emptyText,
  searchValue = "",
  onSearchChange,
}) {
  const { t } = useTranslation(PROMOTIONS_NAMESPACE);

  const resolveTypeLabel = (type) => {
    if (type === "PERCENTAGE") return t("types.percentageFull");
    if (type === "FIXED_AMOUNT" || type === "FIXED") return t("types.fixedFull");
    return type || "—";
  };

  const columns = useMemo(
    () => [
      { key: "id", title: t("table.id"), render: (row) => row.id ?? "—" },
      {
        key: "name",
        title: t("table.name"),
        render: (row) => <strong>{row.name || "—"}</strong>,
      },
      {
        key: "code",
        title: t("table.code"),
        render: (row) => (
          <span className="promo-code-badge">{row.code || "—"}</span>
        ),
      },
      {
        key: "type",
        title: t("table.type"),
        render: (row) => resolveTypeLabel(row.type),
      },
      {
        key: "value",
        title: t("table.discount"),
        render: (row) =>
          row.type === "PERCENTAGE"
            ? `${row.percentageValue ?? 0}%`
            : `${Number(row.fixedAmount || 0).toLocaleString("uz-UZ")} UZS`,
      },
      {
        key: "minimumOrderAmount",
        title: t("table.minOrder"),
        render: (row) => row.minimumOrderAmount ?? "—",
      },
      {
        key: "numberOfOrder",
        title: t("table.orderCount"),
        render: (row) => row.numberOfOrder ?? "—",
      },
      {
        key: "usageCount",
        title: t("table.usageCount"),
        render: (row) => row.usageCount ?? "—",
      },
      {
        key: "startDate",
        title: t("table.startDate"),
        render: (row) => row.startDate || "—",
      },
      {
        key: "endDate",
        title: t("table.endDate"),
        render: (row) => row.endDate || "—",
      },
      {
        key: "active",
        title: t("table.status"),
        render: (row) => (
          <StatusBadge
            variant={inferStatusVariant(row.active, "active")}
            label={row.active ? t("status.active") : t("status.inactive")}
          />
        ),
      },
    ],
    [t]
  );

  const paginationLabels = useMemo(
    () => ({
      total: (count) => t("pagination.total", { count }),
      perPage: t("pagination.rowsPerPage"),
      previous: t("pagination.previous"),
      next: t("pagination.next"),
      actions: t("table.actions"),
    }),
    [t]
  );

  const actions = useMemo(
    () => [
      {
        label: t("buttons.view"),
        icon: <Eye size={16} />,
        variant: "view",
        when: () => readOnly,
        onClick: (row) => onView?.(row),
      },
      {
        label: t("buttons.edit"),
        icon: <Pencil size={16} />,
        variant: "edit",
        when: () => !readOnly,
        onClick: (row) => onEdit?.(row),
      },
      {
        label: t("buttons.delete"),
        icon: <Trash2 size={16} />,
        variant: "delete",
        when: () => !readOnly,
        onClick: (row) => onDelete?.(row.id),
      },
    ],
    [t, readOnly, onView, onEdit, onDelete]
  );

  return (
    <div className="promo-table-card">
      <div className="promo-table-header">
        <h3>{t("table.promoCodesListTitle")}</h3>
        <div className="promo-table-tools">
          <div className="promo-search-box">
            <Search size={15} />
            <input
              type="text"
              placeholder={t("search.placeholder")}
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
            />
          </div>
          <button
            type="button"
            className="promo-icon-btn"
            title={t("buttons.download")}
          >
            <Download size={15} />
          </button>
        </div>
      </div>

      <GlobalTable
        className="global-table--flat"
        columns={columns}
        data={items}
        loading={loading}
        emptyText={emptyText ?? t("states.noData")}
        loadingText={t("states.loading")}
        paginationLabels={paginationLabels}
        rowKey={(row, index) => `${row.id ?? "promo"}-${index}`}
        actions={actions}
        pagination={{ client: true }}
      />
    </div>
  );
}
