import { useState } from "react";
import "./BranchesHeader.css";
import { Plus } from "lucide-react";
import AddBranchModal from "./components/AddBranchModal/";

export default function BranchesHeader() {
  const [openModal, setOpenModal] = useState(false);

  return (
    <>
      <div className="branches-header">
        <div className="branches-header-left">
          <h1>Filiallar</h1>
          <p>Barcha filiallarni boshqaring</p>
        </div>

        <button
          className="branches-add-btn"
          type="button"
          onClick={() => setOpenModal(true)}
        >
          <Plus size={18} />
          <span>Yangi filial</span>
        </button>
      </div>

      <AddBranchModal
        open={openModal}
        onClose={() => setOpenModal(false)}
      />
    </>
  );
}