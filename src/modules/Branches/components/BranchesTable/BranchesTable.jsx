import { useMemo, useState, useCallback } from "react";
import { Download, Eye, Pencil, Trash2 } from "lucide-react";
import { useGlobalNotification } from "@/hooks/useGlobalNotification";
import { useScopedPartnerParams } from "@/hooks/useScopedPartnerParams";
import { useAuth } from "@/core/hooks/useAuth";
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

function BranchesTable({ data = [], loading = false, onRefresh, emptyText = "Ma'lumot topilmadi" }) {
  const { success } = useGlobalNotification();
  const { isSuperAdmin } = useAuth();
  const { canFetch, hasPartnerSelected, getOrganizationBranchParams } =
    useScopedPartnerParams();

  const tableData = useMemo(
    () =>
      data.map((item) => ({
        ...item,
        phone: item?.phone || item?.phoneNumber || "-",
        formattedAddress: pickAddress(item),
        active: item?.active ?? item?.isActive ?? true,
      })),
    [data]
  );

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewedBranch, setViewedBranch] = useState(null);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const handleView = useCallback(
    async (branch) => {
      if (!branch?.id) return;

      if (isSuperAdmin) {
        if (!canFetch || !hasPartnerSelected) return;

        const orgParams = getOrganizationBranchParams();
        if (!orgParams.organizationId) return;

        setViewedBranch(branch);
        setIsViewOpen(true);
        setViewLoading(false);
        return;
      }

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
    },
    [
      isSuperAdmin,
      canFetch,
      hasPartnerSelected,
      getOrganizationBranchParams,
    ]
  );

  const closeView = () => {
    if (viewLoading) return;
    setIsViewOpen(false);
    setViewedBranch(null);
  };

  const handleEdit = useCallback(
    async (branch) => {
      if (isSuperAdmin || !branch?.id || actionLoading) return;

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
    },
    [isSuperAdmin, actionLoading]
  );

  const closeEditModal = () => {
    if (actionLoading) return;
    setSelectedBranch(null);
    setIsEditOpen(false);
  };

  const handleDelete = useCallback(
    (branch) => {
      if (isSuperAdmin || !branch?.id || actionLoading) return;
      setSelectedBranch(branch);
      setIsDeleteOpen(true);
    },
    [isSuperAdmin, actionLoading]
  );

  const closeDeleteModal = () => {
    if (actionLoading) return;
    setSelectedBranch(null);
    setIsDeleteOpen(false);
  };

  const handleSaveEdit = async (payload) => {
    if (isSuperAdmin || !selectedBranch?.id || !payload) return;

    try {
      setActionLoading(true);
      await api.organizationBranch.update(selectedBranch.id, payload);
      success("Muvaffaqiyatli yangilandi");
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
    if (isSuperAdmin || !selectedBranch?.id) return;

    try {
      setActionLoading(true);
      await api.organizationBranch.delete(selectedBranch.id);
      success("Muvaffaqiyatli o'chirildi");
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
      { key: "name", title: "Filial nomi", className: "name-cell" },
      { key: "phone", title: "Telefon" },
      {
        key: "formattedAddress",
        title: "Manzil",
        className: "address-cell",
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
        onClick: (row) => handleView(row),
      },
      {
        label: "Tahrirlash",
        icon: <Pencil size={16} />,
        variant: "edit",
        title: "Super Admin uchun ruxsat yo‘q",
        when: () => !isSuperAdmin,
        onClick: (row) => handleEdit(row),
      },
      {
        label: "O'chirish",
        icon: <Trash2 size={16} />,
        variant: "delete",
        title: "Super Admin uchun ruxsat yo‘q",
        when: () => !isSuperAdmin,
        onClick: (row) => handleDelete(row),
      },
    ],
    [isSuperAdmin, handleView, handleEdit, handleDelete]
  );

  return (
    <>
      <div className="branches-table-card">
        <div className="branches-table-header">
          <h3>Filial ro&apos;yxati</h3>
          <div className="branches-table-tools">
            <button
              className="branches-download-btn"
              type="button"
              onClick={() => console.log("Export")}
              title="Yuklab olish"
            >
              <Download size={16} />
            </button>
          </div>
        </div>

        <GlobalTable
          className="global-table--flat"
          columns={columns}
          data={tableData}
          loading={loading}
          emptyText={emptyText}
          rowKey="id"
          actions={actions}
          pagination={{ client: true }}
        />
      </div>

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
