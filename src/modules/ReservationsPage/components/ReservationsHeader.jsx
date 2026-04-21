import { useState } from "react";
import { FiPlus } from "react-icons/fi";
import ProductModal from "../modal/ProductModal";

export default function ReservationsHeader() {
  const [open,setOpen] = useState(false);
  return (
    <div className="reservations-header">
      <div>
        <h1 className="page-title">Bandlar</h1>
        <p className="page-subtitle">
          Restoran bandlovlarini boshqarish
        </p>
      </div>

      <button className="primary-button" onClick={()=>setOpen(true)}>
        <FiPlus /> Yangi band
      </button>

      <ProductModal
      open={open}
      onClose={()=>setOpen(false)}
    />

    </div>
  );
}