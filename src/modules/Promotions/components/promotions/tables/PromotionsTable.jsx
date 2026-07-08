import { useMemo } from "react";
import { Download, Eye, Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import GlobalTable from "@/components/GlobalTable/GlobalTable";
import StatusBadge, { inferStatusVariant } from "@/components/StatusBadge/StatusBadge";
import { PROMOTIONS_NAMESPACE } from "@/i18n/namespaces";
import "./PromotionsTable.css";

export default function PromotionsTable({
  items = [],
  loading = false,
  onView,
  onEdit,
  onDelete,
  readOnly = false,
  emptyText,
}) {
  const { t } = useTranslation(PROMOTIONS_NAMESPACE);

  const columns = useMemo(
    () => {
      const resolveTypeLabel = (row) => {
        const rawType = row?.raw?.type;
        if (rawType === "PERCENTAGE") return t("types.percentage");
        if (rawType === "FIXED" || rawType === "FIXED_AMOUNT") return t("types.fixed");
        return row.type || "—";
      };

      return [
      {
        key: "name",
        title: t("table.name"),
        className: "name-cell",
        render: (row) => <strong>{row.name || "—"}</strong>,
      },
      {
        key: "code",
        title: t("table.code"),
        render: (row) => row.code || "—",
      },
      {
        key: "type",
        title: t("table.type"),
        render: (row) => resolveTypeLabel(row),
      },
      {
        key: "discount",
        title: t("table.discount"),
        render: (row) => row.discount ?? row.value ?? "—",
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
        key: "status",
        title: t("table.status"),
        render: (row) => (
          <StatusBadge
            variant={inferStatusVariant(row.active, "active")}
            label={
              row.active ? t("status.active") : t("status.inactive")
            }
          />
        ),
      },
    ];
    },
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
        <h3>{t("table.listTitle")}</h3>
        <div className="promo-table-tools">
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
        rowKey="id"
        actions={actions}
        pagination={{ client: true }}
      />
    </div>
  );
}
