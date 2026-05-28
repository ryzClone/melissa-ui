import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { api } from "@/api";
import GlobalTable from "@/components/GlobalTable/GlobalTable";

import "./BranchesTable.css";
import EditBranchModal from "./components/EditBranchModal";
import DeleteBranchModal from "./components/DeleteBranchModal";
import ViewBranchModal from "./components/ViewBranchModal";

function pickAddress(branch) {
  const address = branch?.address;

  if (typeof address === "string" && address.trim()) {
    return address;
  }

  return (
    address?.formattedAddress ||
    address?.title ||
    branch?.formattedAddress ||
    "-"
  );
}

function BranchesTable({
  data = [],
  loading = false,
  onRefresh,
}) {
  const [search, setSearch] = useState("");

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewedBranch, setViewedBranch] = useState(null);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const tableData = useMemo(() => {
    const normalized = data.map((item) => ({
      ...item,
      phone: item?.phone || item?.phoneNumber || "-",
      formattedAddress: pickAddress(item),
    }));

    const q = search.trim().toLowerCase();
    if (!q) return normalized;

    return normalized.filter((item) =>
      [item.id, item.name, item.phone, item.formattedAddress]
        .map((v) => String(v ?? "").toLowerCase())
        .some((v) => v.includes(q))
    );
  }, [data, search]);

  const handleView = async (branch) => {
    if (!branch?.id) return;

    setViewedBranch(branch);
    setIsViewOpen(true);
    setViewLoading(true);

    try {
      const res = await api.organizationBranch.getById(branch.id);
      const full = res?.data || branch;
      setViewedBranch(full);
    } catch (error) {
      console.error(error?.message || "Filial ma'lumotini olishda xatolik");
    } finally {
      setViewLoading(false);
    }
  };

  const closeView = () => {
    if (viewLoading) return;
    setIsViewOpen(false);
    setViewedBranch(null);
  };

  const handleEdit = async (branch) => {
    if (!branch?.id || actionLoading) return;

    try {
      setActionLoading(true);
      const res = await api.organizationBranch.getById(branch.id);
      const full = res?.data || branch;
      setSelectedBranch(full);
      setIsEditOpen(true);
    } catch (error) {
      console.error(error?.message || "Filial ma'lumotini olishda xatolik");
      setSelectedBranch(branch);
      setIsEditOpen(true);
    } finally {
      setActionLoading(false);
    }
  };

  const closeEditModal = () => {
    if (actionLoading) return;
    setSelectedBranch(null);
    setIsEditOpen(false);
  };

  const handleDelete = (branch) => {
    if (!branch?.id || actionLoading) return;
    setSelectedBranch(branch);
    setIsDeleteOpen(true);
  };

  const closeDeleteModal = () => {
    if (actionLoading) return;
    setSelectedBranch(null);
    setIsDeleteOpen(false);
  };

  const handleSaveEdit = async (payload) => {
    if (!selectedBranch?.id || !payload) return;

    try {
      setActionLoading(true);
      await api.organizationBranch.update(selectedBranch.id, payload);
      setIsEditOpen(false);
      setSelectedBranch(null);
      if (onRefresh) await onRefresh();
    } catch (error) {
      console.error(error?.message || "Filialni tahrirlashda xatolik");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteBranch = async () => {
    if (!selectedBranch?.id) return;

    try {
      setActionLoading(true);
      await api.organizationBranch.delete(selectedBranch.id);
      setIsDeleteOpen(false);
      setSelectedBranch(null);
      if (onRefresh) await onRefresh();
    } catch (error) {
      console.error(error?.message || "Filialni o'chirishda xatolik");
    } finally {
      setActionLoading(false);
    }
  };

  const columns = useMemo(
    () => [
      { key: "id", label: "ID" },
      { key: "name", label: "Branch name" },
      { key: "phone", label: "Phone" },
      { key: "formattedAddress", label: "Address" },
      { key: "active", label: "Status" },
      { key: "actions", label: "Actions" },
    ],
    []
  );

  const actions = useMemo(
    () => [
      {
        label: "View",
        type: "view",
        onClick: (row) => handleView(row),
      },
      {
        label: "Edit",
        type: "edit",
        onClick: (row) => handleEdit(row),
      },
      {
        label: "Delete",
        type: "delete",
        onClick: (row) => handleDelete(row),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [actionLoading]
  );

  return (
    <>
      <GlobalTable
        title="Filial ro'yxati"
        columns={columns}
        data={tableData}
        actions={actions}
        loading={loading}
        emptyText="Branches not found"
        rowKey="id"
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Qidiruv..."
        headerExtra={
          <button
            className="branches-download-btn"
            type="button"
            onClick={() => console.log("Export")}
            title="Yuklab olish"
          >
            <Download size={16} />
          </button>
        }
      />

      <ViewBranchModal
        isOpen={isViewOpen}
        branch={viewedBranch}
        loading={viewLoading}
        onClose={closeView}
      />

      <EditBranchModal
        isOpen={isEditOpen}
        branch={selectedBranch}
        loading={actionLoading}
        onClose={closeEditModal}
        onSave={handleSaveEdit}
      />

      <DeleteBranchModal
        isOpen={isDeleteOpen}
        branch={selectedBranch}
        loading={actionLoading}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteBranch}
      />
    </>
  );
}

export { BranchesTable };
export default BranchesTable;

