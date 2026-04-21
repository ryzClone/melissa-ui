import { useEffect, useMemo, useState } from "react";
import { Search, Download, Pencil, Trash2, Building2 } from "lucide-react";
import "./BranchesTable.css";
import EditBranchModal from "./components/EditBranchModal/";
import DeleteBranchModal from "./components/DeleteBranchModal/";

const initialBranches = [
  {
    id: "#FL-001",
    name: "Chilonzor Filiali",
    phone: "+998 90 123 45 67",
    address: "Bunyodkor ko‘chasi, 12-uy",
    status: "Aktiv",
  },
  {
    id: "#FL-002",
    name: "Yunusobod Filiali",
    phone: "+998 90 987 65 43",
    address: "A. Temur ko‘chasi, 102-uy",
    status: "Aktiv",
  },
  {
    id: "#FL-003",
    name: "Sergeli Filiali",
    phone: "+998 93 456 12 34",
    address: "Lutfiy ko‘chasi, 45-uy",
    status: "No aktiv",
  },
  {
    id: "#FL-004",
    name: "Mirobod Filiali",
    phone: "+998 97 111 22 33",
    address: "Shaxrisabz ko‘chasi, 2-uy",
    status: "Aktiv",
  },
  {
    id: "#FL-005",
    name: "Olmazor Filiali",
    phone: "+998 90 555 44 22",
    address: "Kichik xalqa yo‘li, 1-uy",
    status: "Aktiv",
  },
  {
    id: "#FL-006",
    name: "Uchtepa Filiali",
    phone: "+998 94 333 99 00",
    address: "Farxod ko‘chasi, 19-uy",
    status: "No aktiv",
  },
  {
    id: "#FL-007",
    name: "Yakkasaroy Filiali",
    phone: "+998 90 222 00 11",
    address: "Bobur ko‘chasi, 40-uy",
    status: "Aktiv",
  },
  {
    id: "#FL-008",
    name: "Shayxontohur Filiali",
    phone: "+998 91 678 22 11",
    address: "Beruniy ko‘chasi, 8-uy",
    status: "Aktiv",
  },
  {
    id: "#FL-009",
    name: "Bektemir Filiali",
    phone: "+998 95 440 11 55",
    address: "Bektemir tumani, 14-uy",
    status: "No aktiv",
  },
];

const PAGE_SIZE = 7;

function getStatusClass(status) {
  return status === "Aktiv" ? "active" : "inactive";
}

export default function BranchesTable() {
  const [branches, setBranches] = useState(initialBranches);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);

  const filteredBranches = useMemo(() => {
    const q = search.trim().toLowerCase();

    return branches.filter((item) => {
      return (
        item.id.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.phone.toLowerCase().includes(q) ||
        item.address.toLowerCase().includes(q) ||
        item.status.toLowerCase().includes(q)
      );
    });
  }, [branches, search]);

  const totalPages = Math.max(1, Math.ceil(filteredBranches.length / PAGE_SIZE));

  const pagedBranches = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredBranches.slice(start, start + PAGE_SIZE);
  }, [filteredBranches, page]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const handlePrev = () => {
    setPage((prev) => Math.max(1, prev - 1));
  };

  const handleNext = () => {
    setPage((prev) => Math.min(totalPages, prev + 1));
  };

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  const openEditModal = (branch) => {
    setSelectedBranch(branch);
    setIsEditOpen(true);
  };

  const closeEditModal = () => {
    setSelectedBranch(null);
    setIsEditOpen(false);
  };

  const openDeleteModal = (branch) => {
    setSelectedBranch(branch);
    setIsDeleteOpen(true);
  };

  const closeDeleteModal = () => {
    setSelectedBranch(null);
    setIsDeleteOpen(false);
  };

  const handleSaveEdit = (updatedBranch) => {
    setBranches((prev) =>
      prev.map((item) =>
        item.id === updatedBranch.id
          ? {
              ...item,
              ...updatedBranch,
            }
          : item
      )
    );

    closeEditModal();
  };

  const handleDeleteBranch = () => {
    if (!selectedBranch) return;

    setBranches((prev) =>
      prev.filter((item) => item.id !== selectedBranch.id)
    );

    closeDeleteModal();
  };

  const handleExport = () => {
    console.log("Export logic shu yerga yoziladi");
  };

  return (
    <>
      <div className="branches-table-card">
        <div className="branches-table-top">
          <h3>Filial ro‘yxati</h3>

          <div className="branches-table-tools">
            <div className="branches-search">
              <Search size={16} />
              <input
                type="text"
                placeholder="Qidiruv..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            <button
              className="branches-download-btn"
              type="button"
              onClick={handleExport}
              title="Yuklab olish"
            >
              <Download size={16} />
            </button>
          </div>
        </div>

        <div className="branches-table-wrap">
          <table className="branches-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>FILIAL NOMI</th>
                <th>TEL RAQAM</th>
                <th>MANZIL</th>
                <th>HOLAT</th>
                <th>HARAKATLAR</th>
              </tr>
            </thead>

            <tbody>
              {pagedBranches.map((item) => (
                <tr key={item.id}>
                  <td className="branch-id">{item.id}</td>

                  <td>
                    <div className="branch-name-cell">
                      <div className="branch-icon-box">
                        <Building2 size={15} />
                      </div>
                      <span>{item.name}</span>
                    </div>
                  </td>

                  <td>{item.phone}</td>
                  <td>{item.address}</td>

                  <td>
                    <span
                      className={`branch-status ${getStatusClass(item.status)}`}
                    >
                      <span className="branch-status-dot" />
                      {item.status}
                    </span>
                  </td>

                  <td>
                    <div className="branch-actions">
                      <button
                        type="button"
                        className="branch-action-btn"
                        onClick={() => openEditModal(item)}
                        title="Tahrirlash"
                      >
                        <Pencil size={15} />
                      </button>

                      <button
                        type="button"
                        className="branch-action-btn danger"
                        onClick={() => openDeleteModal(item)}
                        title="O‘chirish"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {pagedBranches.length === 0 && (
                <tr>
                  <td colSpan="6" className="branches-empty">
                    Hech narsa topilmadi
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="branches-table-footer">
          <p>
            {pagedBranches.length} ta band ko‘rsatilmoqda (jami {filteredBranches.length})
          </p>

          <div className="branches-pagination">
            <button type="button" onClick={handlePrev} disabled={page === 1}>
              Oldingi
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={page === totalPages}
            >
              Keyingi
            </button>
          </div>
        </div>
      </div>

      <EditBranchModal
        isOpen={isEditOpen}
        branch={selectedBranch}
        onClose={closeEditModal}
        onSave={handleSaveEdit}
      />

      <DeleteBranchModal
        isOpen={isDeleteOpen}
        branch={selectedBranch}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteBranch}
      />
    </>
  );
}