import "./ProductModal.css";
import { FiAlertTriangle } from "react-icons/fi";

export default function DeleteProductModal({
  isOpen,
  product,
  onClose,
  onConfirm,
}) {
  if (!isOpen || !product) return null;

  return (
    <div className="pm-overlay" onClick={onClose}>
      <div
        className="pm-modal pm-delete-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pm-header">
          <div>
            <h3>Mahsulotni o‘chirish</h3>
            <p>Bu amalni tasdiqlang</p>
          </div>

          <button className="pm-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="pm-delete-body">
          <div className="pm-delete-icon-wrap">
            <FiAlertTriangle className="pm-delete-icon" />
          </div>

          <h4 className="pm-delete-title">Rostdan ham o‘chirasizmi?</h4>

          <p className="pm-delete-text">
            <strong>{product.name}</strong> mahsulotini o‘chirmoqchisiz.
          </p>

          <div className="pm-delete-note">
            Bu amalni keyin ortga qaytarib bo‘lmaydi.
          </div>

          <div className="pm-delete-actions">
            <button
              type="button"
              className="pm-btn pm-btn-cancel"
              onClick={onClose}
            >
              Bekor qilish
            </button>

            <button
              type="button"
              className="pm-btn pm-btn-delete"
              onClick={onConfirm}
            >
              O‘chirish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}