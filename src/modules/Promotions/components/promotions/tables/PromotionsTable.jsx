import { useEffect, useMemo, useState } from "react";
import { Download } from "lucide-react";
import GlobalTable from "@/components/ui/GlobalTable/GlobalTable";
import "./PromotionsTable.css";

const PAGE_SIZE = 4;

const mapStatusClass = (status) => {
  if (status === "Faol") return "status-active";
  if (status === "Kutilmoqda") return "status-pending";
  return "status-inactive";
};

export default function PromotionsTable({ items = [], onEdit, onDelete }) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return items.slice(startIndex, startIndex + PAGE_SIZE);
  }, [items, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const columns = useMemo(
    () => [
      { key: "id", title: "ID", render: (row) => row.id ?? "—" },
      { key: "type", title: "Turi", render: (row) => row.type || "—" },
      {
        key: "name",
        title: "Nomi",
        render: (row) => <strong>{row.name || "—"}</strong>,
      },
      { key: "value", title: "Qiymat", render: (row) => row.value ?? "—" },
      { key: "period", title: "Muddati", render: (row) => row.period || "—" },
      {
        key: "status",
        title: "Holat",
        render: (row) => (
          <span className={mapStatusClass(row.status)}>{row.status || "—"}</span>
        ),
      },
    ],
    []
  );

  const actions = useMemo(
    () => [
      {
        type: "edit",
        label: "Tahrirlash",
        onClick: (row) => onEdit?.(row),
      },
      {
        type: "delete",
        label: "O'chirish",
        onClick: (row) => onDelete?.(row.id),
      },
    ],
    [onEdit, onDelete]
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
        columns={columns}
        data={paginatedItems}
        emptyText="Ma'lumot topilmadi"
        rowKey="id"
        actions={actions}
        pagination={{
          page: currentPage,
          pageSize: PAGE_SIZE,
          total: items.length,
        }}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
