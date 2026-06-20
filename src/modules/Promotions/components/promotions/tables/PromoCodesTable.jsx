import { useMemo } from "react";
import { Download, Eye, Pencil, Search, Trash2 } from "lucide-react";
import GlobalTable from "@/components/GlobalTable/GlobalTable";
import "./PromotionsTable.css";

export default function PromoCodesTable({
  items = [],
  loading = false,
  onView,
  onEdit,
  onDelete,
  readOnly = false,
  emptyText = "Ma'lumot topilmadi",
  searchValue = "",
  onSearchChange,
}) {
  const columns = useMemo(
    () => [
      { key: "id", title: "ID", render: (row) => row.id ?? "—" },
      {
        key: "name",
        title: "Nomi",
        render: (row) => <strong>{row.name || "—"}</strong>,
      },
      {
        key: "code",
        title: "Kod",
        render: (row) => (
          <span className="promo-code-badge">{row.code || "—"}</span>
        ),
      },
      { key: "type", title: "Turi", render: (row) => row.type || "—" },
      {
        key: "value",
        title: "Chegirma",
        render: (row) =>
          row.type === "PERCENTAGE"
            ? `${row.percentageValue ?? 0}%`
            : `${Number(row.fixedAmount || 0).toLocaleString("uz-UZ")} UZS`,
      },
      {
        key: "minimumOrderAmount",
        title: "Min. buyurtma",
        render: (row) => row.minimumOrderAmount ?? "—",
      },
      {
        key: "numberOfOrder",
        title: "Buyurtmalar soni",
        render: (row) => row.numberOfOrder ?? "—",
      },
      {
        key: "usageCount",
        title: "Ishlatilgan",
        render: (row) => row.usageCount ?? "—",
      },
      {
        key: "startDate",
        title: "Boshlanish",
        render: (row) => row.startDate || "—",
      },
      {
        key: "endDate",
        title: "Tugash",
        render: (row) => row.endDate || "—",
      },
      { key: "active", title: "Holat" },
    ],
    []
  );

  const actions = useMemo(
    () => [
      {
        label: "Ko'rish",
        icon: <Eye size={16} />,
        variant: "view",
        when: () => readOnly,
        onClick: (row) => onView?.(row),
      },
      {
        label: "Tahrirlash",
        icon: <Pencil size={16} />,
        variant: "edit",
        when: () => !readOnly,
        onClick: (row) => onEdit?.(row),
      },
      {
        label: "O'chirish",
        icon: <Trash2 size={16} />,
        variant: "delete",
        when: () => !readOnly,
        onClick: (row) => onDelete?.(row.id),
      },
    ],
    [readOnly, onView, onEdit, onDelete]
  );

  return (
    <div className="promo-table-card">
      <div className="promo-table-header">
        <h3>Promokodlar ro&apos;yxati</h3>
        <div className="promo-table-tools">
          <div className="promo-search-box">
            <Search size={15} />
            <input
              type="text"
              placeholder="Qidiruv..."
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
            />
          </div>
          <button type="button" className="promo-icon-btn">
            <Download size={15} />
          </button>
        </div>
      </div>

      <GlobalTable
        className="global-table--flat"
        columns={columns}
        data={items}
        loading={loading}
        emptyText={emptyText}
        rowKey={(row, index) => `${row.id ?? "promo"}-${index}`}
        actions={actions}
        pagination={{ client: true }}
      />
    </div>
  );
}
