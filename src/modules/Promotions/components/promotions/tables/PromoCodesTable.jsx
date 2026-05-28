import { useEffect, useMemo, useState } from "react";
import { Download, Search } from "lucide-react";
import GlobalTable from "@/components/ui/GlobalTable/GlobalTable";
import "./PromotionsTable.css";

const PAGE_SIZE = 5;

export default function PromoCodesTable({ items = [], onEdit, onDelete }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");

  const filteredItems = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    if (!query) return items;

    return items.filter((item) =>
      [
        item.id,
        item.name,
        item.code,
        item.type,
        item.percentageValue,
        item.fixedAmount,
      ]
        .map((v) => String(v ?? "").toLowerCase())
        .some((v) => v.includes(query))
    );
  }, [items, searchValue]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredItems.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredItems, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchValue]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

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
        title: "Qiymat",
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
        title: "Start",
        render: (row) => row.startDate || "—",
      },
      {
        key: "endDate",
        title: "End",
        render: (row) => row.endDate || "—",
      },
      {
        key: "active",
        title: "Faol",
        render: (row) => (
          <span
            className={row.active ? "status-active" : "status-inactive"}
          >
            {row.active ? "Faol" : "Nofaol"}
          </span>
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
        <h3>Promokodlar ro&apos;yxati</h3>
        <div className="promo-table-tools">
          <div className="promo-search-box">
            <Search size={15} />
            <input
              type="text"
              placeholder="Qidiruv..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>
          <button type="button" className="promo-icon-btn">
            <Download size={15} />
          </button>
        </div>
      </div>

      <GlobalTable
        columns={columns}
        data={paginatedItems}
        emptyText="Ma'lumot topilmadi"
        rowKey={(row, index) => `${row.id ?? "promo"}-${index}`}
        actions={actions}
        pagination={{
          page: currentPage,
          pageSize: PAGE_SIZE,
          total: filteredItems.length,
        }}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
