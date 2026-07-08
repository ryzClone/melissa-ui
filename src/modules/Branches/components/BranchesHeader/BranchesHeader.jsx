import { useState } from "react";
import { useTranslation } from "react-i18next";
import "./BranchesHeader.css";
import { Plus } from "lucide-react";
import { BRANCHES_NAMESPACE } from "@/i18n/namespaces";
import AddBranchModal from "./components/AddBranchModal";

export default function BranchesHeader({ onRefresh }) {
  const { t } = useTranslation(BRANCHES_NAMESPACE);
  const [openModal, setOpenModal] = useState(false);

  return (
    <>
      <div className="branches-header">
        <div className="branches-header-left">
          <h1>{t("title")}</h1>
          <p>{t("subtitle")}</p>
        </div>

        <button
          className="branches-add-btn"
          type="button"
          onClick={() => setOpenModal(true)}
        >
          <Plus size={18} />
          <span>{t("buttons.add")}</span>
        </button>
      </div>

      <AddBranchModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onRefresh={onRefresh}
      />
    </>
  );
}