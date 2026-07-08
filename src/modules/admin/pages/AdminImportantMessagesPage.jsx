import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import PageWrapper from "@/components/PageWrapper/PageWrapper";
import GlobalTable from "@/components/GlobalTable/GlobalTable";
import StatusBadge, {
  inferStatusVariant,
} from "@/components/StatusBadge/StatusBadge";
import CustomDropdown from "@/components/CustomDropdown/CustomDropdown";
import { FilterItem } from "@/components/FilterBar/FilterBar";
import MessageFormModal from "../components/MessageFormModal/MessageFormModal";
import {
  MESSAGE_PRIORITY_FILTER_OPTIONS,
} from "../utils/adminConstants";
import {
  formatCreatedDate,
  getInitialAdminMessages,
  getNextId,
} from "../utils/adminMockData";
import "./adminPage.css";

function getPriorityVariant(priority = "") {
  const normalized = String(priority).toLowerCase();
  if (normalized.includes("yuqori")) return "danger";
  if (normalized.includes("past")) return "info";
  return "warning";
}

export default function AdminImportantMessagesPage() {
  const [messages, setMessages] = useState(getInitialAdminMessages);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    return messages.filter((item) => {
      const matchesPriority =
        priorityFilter === "all" || item.priority === priorityFilter;
      const matchesSearch =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.content.toLowerCase().includes(query);

      return matchesPriority && matchesSearch;
    });
  }, [messages, search, priorityFilter]);

  const openCreateModal = () => {
    setEditingItem(null);
    setFormOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormOpen(true);
  };

  const handleSave = (payload) => {
    if (editingItem) {
      setMessages((prev) =>
        prev.map((item) =>
          item.id === editingItem.id ? { ...item, ...payload } : item
        )
      );
    } else {
      setMessages((prev) => [
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
    if (!window.confirm("Xabarni o‘chirmoqchimisiz?")) return;
    setMessages((prev) => prev.filter((row) => row.id !== item.id));
  };

  const columns = [
    { key: "title", title: "Sarlavha" },
    {
      key: "content",
      title: "Xabar matni",
      render: (row) => <span className="admin-text-clamp">{row.content}</span>,
    },
    {
      key: "priority",
      title: "Prioritet",
      render: (row) => (
        <StatusBadge
          label={row.priority}
          variant={getPriorityVariant(row.priority)}
        />
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
            <h1>Muhim xabarlar</h1>
            <p>Dashboard muhim xabarlarini boshqaring</p>
          </div>

          <div className="admin-page-actions">
            <button
              type="button"
              className="admin-primary-btn"
              onClick={openCreateModal}
            >
              <Plus size={16} />
              <span>Xabar qo‘shish</span>
            </button>
          </div>
        </div>

        <GlobalTable
          columns={columns}
          data={filteredItems}
          actions={actions}
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Sarlavha yoki matn bo‘yicha qidirish..."
          pagination={{ client: true }}
          headerExtra={
            <FilterItem auto>
              <CustomDropdown
                className="admin-table-filter"
                value={priorityFilter}
                options={MESSAGE_PRIORITY_FILTER_OPTIONS}
                onChange={setPriorityFilter}
              />
            </FilterItem>
          }
        />

        <MessageFormModal
          open={formOpen}
          item={editingItem}
          onClose={() => {
            setFormOpen(false);
            setEditingItem(null);
          }}
          onSave={handleSave}
        />
      </div>
    </PageWrapper>
  );
}
