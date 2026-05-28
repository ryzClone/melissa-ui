import { useMemo, useState } from "react";
import {
  Check,
  CreditCard,
  Download,
  Filter,
  Search,
} from "lucide-react";
import GlobalTable from "@/components/ui/GlobalTable/GlobalTable";
import "./FinanceOrdersTable.css";

const paymentTypeClass = {
  Naqd: "cash",
  Karta: "card",
  Click: "click",
  Payme: "payme",
};

const fallbackOrders = [
  {
    id: "#10284",
    type: "Naqd",
    customer: "Anvar Karimov",
    phone: "+998 90 123 45 67",
    avatar: "https://i.pravatar.cc/80?img=12",
    amount: "850,000 so'm",
    date: "Bugun, 14:20",
    branch: "Tashkent City",
    status: "Tasdiqlanmagan",
  },
  {
    id: "#10283",
    type: "Karta",
    customer: "Laylo Usmanova",
    phone: "+998 93 456 78 90",
    avatar: "https://i.pravatar.cc/80?img=28",
    amount: "1,200,000 so'm",
    date: "Bugun, 13:45",
    branch: "Chilonzor",
    status: "Tasdiqlanmagan",
  },
  {
    id: "#10282",
    type: "Click",
    customer: "Sherzod Bekov",
    phone: "+998 94 999 88 77",
    avatar: "https://i.pravatar.cc/80?img=33",
    amount: "450,000 so'm",
    date: "Bugun, 12:10",
    branch: "Beruniy",
    status: "Tasdiqlanmagan",
  },
  {
    id: "#10281",
    type: "Payme",
    customer: "Nigora Alieva",
    phone: "+998 88 444 33 22",
    avatar: "https://i.pravatar.cc/80?img=45",
    amount: "2,150,000 so'm",
    date: "Bugun, 10:30",
    branch: "Mirobod",
    status: "Tasdiqlanmagan",
  },
  {
    id: "#10280",
    type: "Naqd",
    customer: "Jasur Abidov",
    phone: "+998 97 112 23 33",
    avatar: "https://i.pravatar.cc/80?img=14",
    amount: "125,000 so'm",
    date: "Kecha, 22:50",
    branch: "Tashkent City",
    status: "Tasdiqlanmagan",
  },
  {
    id: "#10279",
    type: "Naqd",
    customer: "Zarina Ergasheva",
    phone: "+998 90 777 66 55",
    avatar: "https://i.pravatar.cc/80?img=25",
    amount: "540,000 so'm",
    date: "Kecha, 21:15",
    branch: "Samarqand",
    status: "Tasdiqlanmagan",
  },
  {
    id: "#10278",
    type: "Karta",
    customer: "Otabek Soliev",
    phone: "+998 99 333 44 55",
    avatar: "https://i.pravatar.cc/80?img=52",
    amount: "89,000 so'm",
    date: "Kecha, 18:40",
    branch: "Tashkent City",
    status: "Tasdiqlanmagan",
  },
];

export default function FinanceOrdersTable({
  orders,
  title = "Tasdiqlanmagan naqd buyurtmalar",
  totalCount,
  pageSize = 7,
  onApprove,
  onDownload,
}) {
  const tableOrders =
    Array.isArray(orders) && orders.length > 0 ? orders : fallbackOrders;

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [page, setPage] = useState(1);

  const filteredOrders = useMemo(() => {
    return tableOrders.filter((order) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        String(order.id || "").toLowerCase().includes(searchValue) ||
        String(order.customer || "").toLowerCase().includes(searchValue) ||
        String(order.phone || "").toLowerCase().includes(searchValue) ||
        String(order.branch || "").toLowerCase().includes(searchValue);

      const matchesFilter =
        activeFilter === "all" || order.type === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [tableOrders, search, activeFilter]);

  const total = filteredOrders.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);

  const paginatedOrders = useMemo(
    () =>
      filteredOrders.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
      ),
    [filteredOrders, currentPage, pageSize]
  );

  const newCount = tableOrders.filter(
    (order) => order.status === "Tasdiqlanmagan" || !order.status
  ).length;

  const handleFilterToggle = () => {
    const filters = ["all", "Naqd", "Karta", "Click", "Payme"];
    const currentIndex = filters.indexOf(activeFilter);
    const nextIndex =
      currentIndex === filters.length - 1 ? 0 : currentIndex + 1;

    setActiveFilter(filters[nextIndex]);
    setPage(1);
  };

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  const columns = useMemo(
    () => [
      {
        key: "id",
        title: "ID",
        render: (row) => <strong>{row.id || "—"}</strong>,
      },
      {
        key: "type",
        title: "Turi",
        render: (row) => {
          const typeClass =
            row.typeClass || paymentTypeClass[row.type] || "cash";
          return (
            <span className={`payment-type ${typeClass}`}>
              <CreditCard size={12} />
              {row.type || "—"}
            </span>
          );
        },
      },
      {
        key: "customer",
        title: "Mijoz",
        render: (row) => (
          <div className="finance-customer">
            <img
              src={row.avatar || "https://i.pravatar.cc/80"}
              alt={row.customer || "Customer"}
            />
            <div>
              <strong>{row.customer || "—"}</strong>
              <span>{row.phone || "—"}</span>
            </div>
          </div>
        ),
      },
      {
        key: "amount",
        title: "Summa",
        render: (row) => <b>{row.amount || "—"}</b>,
      },
      {
        key: "date",
        title: "Sana",
        render: (row) => (
          <span className="muted-text">{row.date || "—"}</span>
        ),
      },
      {
        key: "branch",
        title: "Filial",
        render: (row) => (
          <span className="branch-text">{row.branch || "—"}</span>
        ),
      },
      {
        key: "status",
        title: "Holat",
        render: (row) => (
          <span className="status-pending">
            {row.status || "Tasdiqlanmagan"}
          </span>
        ),
      },
    ],
    []
  );

  const actions = useMemo(
    () => [
      {
        icon: <Check size={16} />,
        title: "Tasdiqlash",
        className: "success",
        onClick: (row) => onApprove?.(row),
      },
    ],
    [onApprove]
  );

  return (
    <div className="finance-table-card">
      <div className="finance-table-top">
        <div className="finance-table-title">
          <h2>{title}</h2>
          <span>{newCount} ta yangi</span>
        </div>

        <div className="finance-table-actions">
          <div className="finance-table-search">
            <Search size={16} />
            <input
              value={search}
              placeholder="Qidirish..."
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          <button
            type="button"
            className={activeFilter !== "all" ? "filter-active" : ""}
            onClick={handleFilterToggle}
            title={activeFilter === "all" ? "Barcha" : activeFilter}
          >
            <Filter size={16} />
          </button>

          <button type="button" onClick={() => onDownload?.(filteredOrders)}>
            <Download size={16} />
          </button>
        </div>
      </div>

      <div className="finance-filter-info">
        <span>
          Filter: <b>{activeFilter === "all" ? "Barchasi" : activeFilter}</b>
        </span>

        {search && (
          <button type="button" onClick={() => handleSearch("")}>
            Qidiruvni tozalash
          </button>
        )}
      </div>

      <div className="finance-table-wrap">
        <GlobalTable
          className="finance-global-table"
          columns={columns}
          data={paginatedOrders}
          emptyText="Ma'lumot topilmadi"
          rowKey="id"
          actions={actions}
          pagination={{
            page: currentPage,
            pageSize,
            total,
          }}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
