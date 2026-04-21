import { useEffect, useState } from "react";
import { FiUploadCloud, FiImage } from "react-icons/fi";
import "./ProductModal.css";

export default function EditProductModal({ isOpen, product, onClose, onSave }) {
  const [form, setForm] = useState({
    id: "",
    name: "",
    sku: "",
    price: "",
    stock: "",
    status: "active",
    statusText: "Faol",
    img: "",
  });

  const [preview, setPreview] = useState("");
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    if (product) {
      setForm(product);
      setPreview(product.img || "");
      setImageFile(null);
    }
  }, [product]);

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  if (!isOpen || !product) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "status") {
      setForm((prev) => ({
        ...prev,
        status: value,
        statusText: value === "active" ? "Faol" : "Tugagan",
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: name === "stock" ? Number(value) : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (preview && preview.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }

    const filePreview = URL.createObjectURL(file);
    setImageFile(file);
    setPreview(filePreview);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      img: preview,     // vaqtincha preview url
      imageFile,        // backendga yuborish uchun asli file
    };

    onSave(payload);
  };

  return (
    <div className="pm-overlay" onClick={onClose}>
      <div className="pm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="pm-header">
          <div>
            <h3>Mahsulotni tahrirlash</h3>
            <p>Mahsulot ma’lumotlarini yangilang</p>
          </div>
          <button className="pm-close" onClick={onClose}>
            ×
          </button>
        </div>

        <form className="pm-form" onSubmit={handleSubmit}>
          <div className="pm-upload-box">
            <label className="pm-upload-label">Mahsulot rasmi</label>

            <div className="pm-upload-area">
              <div className="pm-preview">
                {preview ? (
                  <img src={preview} alt={form.name} className="pm-preview-img" />
                ) : (
                  <div className="pm-preview-empty">
                    <FiImage />
                    <span>Rasm yo‘q</span>
                  </div>
                )}
              </div>

              <div className="pm-upload-content">
                <label className="pm-upload-btn">
                  <FiUploadCloud />
                  <span>Rasm yuklash</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    hidden
                  />
                </label>

                <p className="pm-upload-hint">
                  PNG, JPG, JPEG formatlar tavsiya etiladi
                </p>

                {imageFile && (
                  <div className="pm-file-name">{imageFile.name}</div>
                )}
              </div>
            </div>
          </div>

          <div className="pm-grid">
            <div className="pm-group">
              <label>Nom</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
              />
            </div>

            <div className="pm-group">
              <label>SKU</label>
              <input
                type="text"
                name="sku"
                value={form.sku}
                onChange={handleChange}
              />
            </div>

            <div className="pm-group">
              <label>Narx</label>
              <input
                type="text"
                name="price"
                value={form.price}
                onChange={handleChange}
              />
            </div>

            <div className="pm-group">
              <label>Zaxira</label>
              <input
                type="number"
                name="stock"
                value={form.stock}
                onChange={handleChange}
              />
            </div>

            <div className="pm-group pm-full">
              <label>Holat</label>
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="active">Faol</option>
                <option value="inactive">Tugagan</option>
              </select>
            </div>
          </div>

          <div className="pm-actions">
            <button type="button" className="pm-btn pm-btn-cancel" onClick={onClose}>
              Bekor qilish
            </button>
            <button type="submit" className="pm-btn pm-btn-save">
              Saqlash
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}