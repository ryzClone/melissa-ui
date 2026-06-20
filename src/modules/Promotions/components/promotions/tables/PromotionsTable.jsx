import { useMemo } from "react";
import { Download, Eye, Pencil, Trash2 } from "lucide-react";
import GlobalTable from "@/components/GlobalTable/GlobalTable";
import "./PromotionsTable.css";

export default function PromotionsTable({
  items = [],
  loading = false,
  onView,
  onEdit,
  onDelete,
  readOnly = false,
  emptyText = "Ma'lumot topilmadi",
}) {
  const columns = useMemo(
    () => [
      {
        key: "name",
        title: "Nomi",
        className: "name-cell",
        render: (row) => <strong>{row.name || "—"}</strong>,
      },
      {
        key: "code",
        title: "Kod",
        render: (row) => row.code || "—",
      },
      { key: "type", title: "Turi", render: (row) => row.type || "—" },
      {
        key: "discount",
        title: "Chegirma",
        render: (row) => row.discount ?? row.value ?? "—",
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
      { key: "status", title: "Holat" },
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
        <h3>Aksiyalar ro&apos;yxati</h3>
        <div className="promo-table-tools">
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
        rowKey="id"
        actions={actions}
        pagination={{ client: true }}
      />
    </div>
  );
}
