import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import PageWrapper from "@/components/PageWrapper/PageWrapper";
import GlobalTable from "@/components/GlobalTable/GlobalTable";
import StatusBadge, {
  inferStatusVariant,
} from "@/components/StatusBadge/StatusBadge";
import CustomDropdown from "@/components/CustomDropdown/CustomDropdown";
import { FilterItem } from "@/components/FilterBar/FilterBar";
import NewsFormModal from "../components/NewsFormModal/NewsFormModal";
import NewsViewModal from "../components/NewsViewModal/NewsViewModal";
import { NEWS_STATUS_FILTER_OPTIONS } from "../utils/adminConstants";
import {
  formatCreatedDate,
  getInitialAdminNews,
  getNextId,
} from "../utils/adminMockData";
import "./adminPage.css";

export default function AdminNewsPage() {
  const [newsItems, setNewsItems] = useState(getInitialAdminNews);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    return newsItems.filter((item) => {
      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;
      const matchesSearch =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.shortDescription.toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [newsItems, search, statusFilter]);

  const openCreateModal = () => {
    setEditingItem(null);
    setFormOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormOpen(true);
  };

  const openViewModal = (item) => {
    setSelectedItem(item);
    setViewOpen(true);
  };

  const handleSave = (payload) => {
    if (editingItem) {
      setNewsItems((prev) =>
        prev.map((item) =>
          item.id === editingItem.id ? { ...item, ...payload } : item
        )
      );
    } else {
      setNewsItems((prev) => [
        {
          id: getNextId(prev),
          createdAt: formatCreatedDate(new Date()),
          ...payload,
        },
        ...prev,
      ]);
    }

    setFormOpen(false);
    setEditingItem(null);
  };

  const handleDelete = (item) => {
    if (!window.confirm("Yangilikni o‘chirmoqchimisiz?")) return;
    setNewsItems((prev) => prev.filter((row) => row.id !== item.id));
  };

  const columns = [
    {
      key: "image",
      title: "Rasm",
      render: (row) =>
        row.image ? (
          <img src={row.image} alt="" className="admin-news-preview" />
        ) : (
          "—"
        ),
    },
    { key: "title", title: "Sarlavha" },
    {
      key: "shortDescription",
      title: "Qisqa tavsif",
      render: (row) => (
        <span className="admin-text-clamp">{row.shortDescription}</span>
      ),
    },
    {
      key: "status",
      title: "Status",
      render: (row) => (
        <StatusBadge
          label={row.status}
          variant={inferStatusVariant(row.status)}
        />
      ),
    },
    { key: "createdAt", title: "Yaratilgan sana" },
  ];

  const actions = [
    {
      variant: "view",
      title: "Ko‘rish",
      onClick: (row) => openViewModal(row),
    },
    {
      variant: "edit",
      title: "Tahrirlash",
      onClick: (row) => openEditModal(row),
    },
    {
      variant: "delete",
      title: "O‘chirish",
      onClick: (row) => handleDelete(row),
    },
  ];

  return (
    <PageWrapper>
      <div className="admin-page">
        <div className="admin-page-top">
          <div>
            <h1>Yangiliklar</h1>
            <p>Dashboard yangiliklarini boshqaring</p>
          </div>

          <div className="admin-page-actions">
            <button
              type="button"
              className="admin-primary-btn"
              onClick={openCreateModal}
            >
              <Plus size={16} />
              <span>Yangilik qo‘shish</span>
            </button>
          </div>
        </div>

        <GlobalTable
          columns={columns}
          data={filteredItems}
          actions={actions}
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Sarlavha yoki tavsif bo‘yicha qidirish..."
          pagination={{ client: true }}
          headerExtra={
            <FilterItem auto>
              <CustomDropdown
                className="admin-table-filter"
                value={statusFilter}
                options={NEWS_STATUS_FILTER_OPTIONS}
                onChange={setStatusFilter}
              />
            </FilterItem>
          }
        />

        <NewsFormModal
          open={formOpen}
          item={editingItem}
          onClose={() => {
            setFormOpen(false);
            setEditingItem(null);
          }}
          onSave={handleSave}
        />

        <NewsViewModal
          open={viewOpen}
          item={selectedItem}
          onClose={() => {
            setViewOpen(false);
            setSelectedItem(null);
          }}
        />
      </div>
    </PageWrapper>
  );
}
