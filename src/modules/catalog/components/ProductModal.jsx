import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ImagePlus, Trash2, X } from "lucide-react";
import { attachmentApi } from "@/api/modules/attachmentApi";
import { merchantCategoryApi } from "@/api/modules/merchantCategoryApi";
import { merchantProductApi } from "@/api/modules/merchantProductApi";
import { productApi } from "@/api/modules/productApi";
import {
  getAttachmentUrl,
  normalizeAttachmentResponse,
} from "@/modules/products/attachmentUtils";

import "./ProductModal.css";

/* ---------- Constants & helpers ---------- */

const initialForm = {
  nameUz: "",
  nameRu: "",
  nameEn: "",
  descriptionUz: "",
  descriptionRu: "",
  descriptionEn: "",
  categoryId: "",
  price: "",
  attachmentId: null,
  attachment: null,

  measure: "",
  measureUnit: "",
  calories: "",
  carbohydrates: "",
  fat: "",
  proteins: "",
  mxikCodeUz: "",
  packageCodeUz: "",
  vat: "",
  weightQuantum: "",
  catchWeight: false,
  needMarking: false,
  deactivated: false,

  tagIds: [],
  branchIds: [],
};

const str = (value) => (value != null ? String(value) : "");

/* ---------- Category dropdown ---------- */

function CategoryDropdown({ value, options, loading, disabled, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const handleOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  const selected = useMemo(
    () => options.find((opt) => String(opt.id) === String(value)) || null,
    [options, value]
  );

  const label = selected
    ? `${selected.id} - ${selected.name}`
    : loading
      ? "Yuklanmoqda..."
      : "Kategoriya tanlang";

  const isDisabled = disabled || loading;

  return (
    <div ref={ref} className={`pm-custom-select ${open ? "open" : ""}`}>
      <button
        type="button"
        className="pm-custom-select-trigger"
        onClick={() => !isDisabled && setOpen((prev) => !prev)}
        disabled={isDisabled}
      >
        <span className={selected ? "" : "pm-custom-select-placeholder"}>
          {label}
        </span>
        <ChevronDown size={16} />
      </button>

      {open && !isDisabled && (
        <ul className="pm-custom-select-menu">
          {options.length === 0 ? (
            <li className="pm-custom-select-empty">Kategoriya topilmadi</li>
          ) : (
            options.map((category) => (
              <li key={category.id}>
                <button
                  type="button"
                  className={`pm-custom-select-item ${
                    String(category.id) === String(value) ? "active" : ""
                  }`}
                  onClick={() => {
                    onChange(String(category.id));
                    setOpen(false);
                  }}
                >
                  {category.id} - {category.name}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

/* ---------- ProductModal ---------- */

export default function ProductModal({
  isOpen = false,
  mode = "create",
  productId = null,
  onClose,
  onSuccess,
}) {
  const [form, setForm] = useState(initialForm);
  const [imagePreview, setImagePreview] = useState(null);

  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const fileInputRef = useRef(null);

  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";
  const isCreateMode = mode === "create";
  const isBusy = loading || uploadingImage;

  /* ----- Categories: load once when modal opens ----- */
  const fetchCategories = useCallback(async () => {
    try {
      setCategoriesLoading(true);
      const res = await merchantCategoryApi.getAll();
      const payload = res?.data;
      const list = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload)
          ? payload
          : [];

      setCategories(
        list.map((category) => ({
          id: category.id,
          name:
            category.name || category.title || `Kategoriya #${category.id}`,
        }))
      );
    } catch (err) {
      console.error(err);
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    fetchCategories();
  }, [isOpen, fetchCategories]);

  /* ----- Create reset: only when modal opens in create mode ----- */
  useEffect(() => {
    if (!isOpen) return;

    if (mode === "create") {
      setForm(initialForm);
      setImagePreview(null);
      setError("");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [isOpen, mode]);

  /* ----- Edit/View detail load ----- */
  const loadProductDetail = useCallback(async () => {
    if (!productId || mode === "create") return;

    try {
      setLoading(true);
      setError("");

      const res = await merchantProductApi.getById(productId);
      const payload = res?.data?.data || res?.data || null;

      if (!payload) {
        throw new Error("Product topilmadi");
      }

      const attr = payload.productAttribute || {};

      setForm({
        nameUz: payload.nameUz || "",
        nameRu: payload.nameRu || "",
        nameEn: payload.nameEn || "",
        descriptionUz: payload.descriptionUz || "",
        descriptionRu: payload.descriptionRu || "",
        descriptionEn: payload.descriptionEn || "",

        categoryId:
          payload.categoryListDTO?.id ||
          payload.categoryId ||
          payload.category?.id ||
          "",

        price: payload.price ?? "",

        attachmentId: payload.attachment?.id || null,
        attachment: payload.attachment || null,

        measure: str(attr.measure ?? payload.measure),
        measureUnit: attr.measureUnit || "",
        calories: str(attr.calories),
        carbohydrates: str(attr.carbohydrates),
        fat: str(attr.fat),
        proteins: str(attr.proteins),
        mxikCodeUz: attr.mxikCodeUz || "",
        packageCodeUz: attr.packageCodeUz || "",
        vat: str(attr.vat),
        weightQuantum: str(attr.weightQuantum),
        catchWeight: Boolean(attr.catchWeight),
        needMarking: Boolean(attr.needMarking),
        deactivated: Boolean(attr.deactivated),

        tagIds: Array.isArray(payload.tags)
          ? payload.tags.map((item) => item.id)
          : Array.isArray(payload.tagIds)
            ? payload.tagIds
            : [],

        branchIds: Array.isArray(payload.branches)
          ? payload.branches.map((item) => item.id)
          : Array.isArray(payload.branchIds)
            ? payload.branchIds
            : [],
      });

      setImagePreview(getAttachmentUrl(payload.attachment));
    } catch (err) {
      console.error(err);
      setError("Product ma'lumotlarini yuklashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  }, [productId, mode]);

  useEffect(() => {
    if (!isOpen) return;
    if (mode === "edit" || mode === "view") {
      loadProductDetail();
    }
  }, [isOpen, mode, loadProductDetail]);

  /* ----- Lock body scroll ----- */
  useEffect(() => {
    if (!isOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  /* ----- Handlers ----- */

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Faqat rasm fayllar yuklash mumkin");
      return;
    }

    const localPreviewUrl = URL.createObjectURL(file);

    try {
      setUploadingImage(true);
      setError("");

      setImagePreview(localPreviewUrl);

      const res = await attachmentApi.upload(file);

      console.log("ATTACHMENT UPLOAD RAW RES:", res);
      console.log("ATTACHMENT UPLOAD RAW DATA:", res?.data);

      const uploadedAttachment = normalizeAttachmentResponse(res);

      console.log("Normalized attachment:", uploadedAttachment);

      if (!uploadedAttachment.id) {
        // Don't throw — keep local preview so the user can still see the image.
        // But warn so user knows the create payload won't have attachmentId.
        console.warn(
          "Attachment ID topilmadi, faqat lokal preview ko‘rinadi. Raw response:",
          res?.data
        );
        setError(
          "Rasm yuklandi, lekin backend attachment ID qaytarmadi. Backend response shape’ini tekshiring (console’ga log qildim)."
        );
        // Keep local preview, clear attachment
        setForm((prev) => ({
          ...prev,
          attachmentId: null,
          attachment: null,
        }));
        return;
      }

      setForm((prev) => ({
        ...prev,
        attachmentId: Number(uploadedAttachment.id),
        attachment: uploadedAttachment,
      }));

      const backendPreview = getAttachmentUrl(uploadedAttachment);
      setImagePreview(backendPreview || localPreviewUrl);
    } catch (err) {
      console.error("Upload error:", err);
      console.error("Upload error response:", err?.response);

      setError(
        err?.response?.data?.errorMessage ||
          err?.response?.data?.message ||
          err?.message ||
          "Rasm yuklashda xatolik yuz berdi"
      );

      setForm((prev) => ({
        ...prev,
        attachmentId: null,
        attachment: null,
      }));

      setImagePreview(null);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setForm((prev) => ({
      ...prev,
      attachmentId: null,
      attachment: null,
    }));

    setImagePreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /* ----- Build payload ----- */

  const buildProductPayload = () => ({
    nameUz: form.nameUz.trim(),
    nameRu: form.nameRu.trim(),
    nameEn: form.nameEn.trim(),
    descriptionUz: form.descriptionUz.trim() || null,
    descriptionRu: form.descriptionRu.trim() || null,
    descriptionEn: form.descriptionEn.trim() || null,

    categoryId: Number(form.categoryId),

    productAttribute: {
      measure: form.measure !== "" ? Number(form.measure) : null,
      measureUnit: form.measureUnit.trim() || null,
      calories: form.calories.trim() || null,
      carbohydrates: form.carbohydrates.trim() || null,
      fat: form.fat.trim() || null,
      proteins: form.proteins.trim() || null,
      mxikCodeUz: form.mxikCodeUz.trim() || null,
      packageCodeUz: form.packageCodeUz.trim() || null,
      vat: form.vat !== "" ? Number(form.vat) : null,
      weightQuantum:
        form.weightQuantum !== "" ? Number(form.weightQuantum) : null,
      catchWeight: Boolean(form.catchWeight),
      needMarking: Boolean(form.needMarking),
      deactivated: Boolean(form.deactivated),
    },

    price: form.price !== "" ? Number(form.price) : 0,
    attachmentId:
      form.attachmentId !== null && form.attachmentId !== ""
        ? Number(form.attachmentId)
        : null,
    tagIds: Array.isArray(form.tagIds) ? form.tagIds.map(Number) : [],
    branchIds: Array.isArray(form.branchIds) ? form.branchIds.map(Number) : [],
  });

  /* ----- Submit ----- */

  const handleSubmit = async (event) => {
    if (event?.preventDefault) event.preventDefault();
    if (isViewMode) return;

    if (uploadingImage) {
      setError("Rasm yuklanishini kuting");
      return;
    }

    if (!form.nameUz.trim()) {
      setError("O‘zbekcha nom kiriting");
      return;
    }

    if (!form.categoryId) {
      setError("Kategoriya tanlang");
      return;
    }

    if (form.price === "" || Number(form.price) < 0) {
      setError("Narxni to‘g‘ri kiriting");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const payload = buildProductPayload();

      console.log("PRODUCT PAYLOAD:", payload);

      if (isEditMode) {
        await productApi.update(productId, payload);
      } else {
        await productApi.create(payload);
      }

      await onSuccess?.();
      onClose?.();
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.errorMessage ||
          err?.response?.data?.message ||
          "Product saqlashda xatolik yuz berdi"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ----- Render ----- */

  const headerTitle = isCreateMode
    ? "Yangi product"
    : isEditMode
      ? "Productni tahrirlash"
      : "Product tafsiloti";

  const submitLabel = isCreateMode ? "Product yaratish" : "Saqlash";

  return (
    <div className="product-modal-overlay" onClick={onClose}>
      <div
        className="product-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="product-modal-header">
          <div>
            <div className="product-modal-kicker">KATALOG</div>
            <h2>{headerTitle}</h2>
          </div>
          <button
            type="button"
            className="product-modal-close"
            onClick={onClose}
            title="Yopish"
          >
            <X size={18} />
          </button>
        </div>

        {loading && !isCreateMode && !form.nameUz && !form.nameRu ? (
          <div className="product-modal-loading">
            Ma'lumot yuklanmoqda...
          </div>
        ) : (
          <form className="product-modal-body" onSubmit={handleSubmit}>
            {/* ===== Asosiy ma'lumotlar ===== */}
            <section className="product-section">
              <h3 className="product-section-title">Asosiy ma'lumotlar</h3>
              <div className="product-form-grid">
                <div className="product-form-group product-form-full">
                  <label>Kategoriya *</label>
                  <CategoryDropdown
                    value={form.categoryId}
                    options={categories}
                    loading={categoriesLoading}
                    disabled={isViewMode || isBusy}
                    onChange={(value) => handleChange("categoryId", value)}
                  />
                </div>

                <div className="product-form-group">
                  <label>Nomi (UZ) *</label>
                  <input
                    type="text"
                    value={form.nameUz}
                    onChange={(e) => handleChange("nameUz", e.target.value)}
                    placeholder="Mahsulot nomi"
                    disabled={isViewMode || isBusy}
                  />
                </div>

                <div className="product-form-group">
                  <label>Nomi (RU)</label>
                  <input
                    type="text"
                    value={form.nameRu}
                    onChange={(e) => handleChange("nameRu", e.target.value)}
                    placeholder="Название"
                    disabled={isViewMode || isBusy}
                  />
                </div>

                <div className="product-form-group">
                  <label>Nomi (EN)</label>
                  <input
                    type="text"
                    value={form.nameEn}
                    onChange={(e) => handleChange("nameEn", e.target.value)}
                    placeholder="Name"
                    disabled={isViewMode || isBusy}
                  />
                </div>

                <div className="product-form-group">
                  <label>Narxi *</label>
                  <input
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={(e) => handleChange("price", e.target.value)}
                    placeholder="0"
                    disabled={isViewMode || isBusy}
                  />
                </div>
              </div>
            </section>

            {/* ===== Rasm ===== */}
            <section className="product-section">
              <h3 className="product-section-title">Rasm</h3>
              <div className="product-image-upload-card">
                <div className="product-image-preview">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Product"
                      onError={() => {
                        console.error("Image load failed:", imagePreview);
                        setImagePreview(null);
                      }}
                    />
                  ) : (
                    <div className="product-image-placeholder">
                      <ImagePlus size={28} />
                      <span>Rasm yo‘q</span>
                    </div>
                  )}
                </div>

                <div className="product-image-info">
                  <h4>Product rasmi</h4>
                  <p>PNG, JPG yoki WEBP formatda rasm yuklang</p>

                  {!isViewMode && (
                    <div className="product-image-actions">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="product-image-file-input"
                        disabled={uploadingImage}
                      />
                      <button
                        type="button"
                        className="product-image-upload-btn"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage}
                      >
                        {uploadingImage
                          ? "Yuklanmoqda..."
                          : imagePreview
                            ? "Rasmni almashtirish"
                            : "Rasm tanlash"}
                      </button>

                      {imagePreview && (
                        <button
                          type="button"
                          className="product-image-remove-btn"
                          onClick={handleRemoveImage}
                          disabled={uploadingImage}
                        >
                          <Trash2 size={14} />
                          <span>O‘chirish</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* ===== Tavsiflar ===== */}
            <section className="product-section">
              <h3 className="product-section-title">Tavsiflar</h3>
              <div className="product-form-grid">
                <div className="product-form-group product-form-full">
                  <label>Tavsif (UZ)</label>
                  <textarea
                    rows={3}
                    value={form.descriptionUz}
                    onChange={(e) =>
                      handleChange("descriptionUz", e.target.value)
                    }
                    disabled={isViewMode || isBusy}
                  />
                </div>

                <div className="product-form-group product-form-full">
                  <label>Tavsif (RU)</label>
                  <textarea
                    rows={3}
                    value={form.descriptionRu}
                    onChange={(e) =>
                      handleChange("descriptionRu", e.target.value)
                    }
                    disabled={isViewMode || isBusy}
                  />
                </div>

                <div className="product-form-group product-form-full">
                  <label>Tavsif (EN)</label>
                  <textarea
                    rows={3}
                    value={form.descriptionEn}
                    onChange={(e) =>
                      handleChange("descriptionEn", e.target.value)
                    }
                    disabled={isViewMode || isBusy}
                  />
                </div>
              </div>
            </section>

            {/* ===== Product attribute ===== */}
            <section className="product-section">
              <h3 className="product-section-title">Product attribute</h3>
              <div className="product-form-grid">
                <div className="product-form-group">
                  <label>Measure</label>
                  <input
                    type="number"
                    step="any"
                    value={form.measure}
                    onChange={(e) => handleChange("measure", e.target.value)}
                    placeholder="—"
                    disabled={isViewMode || isBusy}
                  />
                </div>

                <div className="product-form-group">
                  <label>Measure Unit</label>
                  <input
                    type="text"
                    value={form.measureUnit}
                    onChange={(e) =>
                      handleChange("measureUnit", e.target.value)
                    }
                    placeholder="kg, g, ml..."
                    disabled={isViewMode || isBusy}
                  />
                </div>

                <div className="product-form-group">
                  <label>Calories</label>
                  <input
                    type="text"
                    value={form.calories}
                    onChange={(e) => handleChange("calories", e.target.value)}
                    placeholder="—"
                    disabled={isViewMode || isBusy}
                  />
                </div>

                <div className="product-form-group">
                  <label>Carbohydrates</label>
                  <input
                    type="text"
                    value={form.carbohydrates}
                    onChange={(e) =>
                      handleChange("carbohydrates", e.target.value)
                    }
                    placeholder="—"
                    disabled={isViewMode || isBusy}
                  />
                </div>

                <div className="product-form-group">
                  <label>Fat</label>
                  <input
                    type="text"
                    value={form.fat}
                    onChange={(e) => handleChange("fat", e.target.value)}
                    placeholder="—"
                    disabled={isViewMode || isBusy}
                  />
                </div>

                <div className="product-form-group">
                  <label>Proteins</label>
                  <input
                    type="text"
                    value={form.proteins}
                    onChange={(e) => handleChange("proteins", e.target.value)}
                    placeholder="—"
                    disabled={isViewMode || isBusy}
                  />
                </div>

                <div className="product-form-group">
                  <label>MXIK Code (UZ)</label>
                  <input
                    type="text"
                    value={form.mxikCodeUz}
                    onChange={(e) =>
                      handleChange("mxikCodeUz", e.target.value)
                    }
                    placeholder="—"
                    disabled={isViewMode || isBusy}
                  />
                </div>

                <div className="product-form-group">
                  <label>Package Code (UZ)</label>
                  <input
                    type="text"
                    value={form.packageCodeUz}
                    onChange={(e) =>
                      handleChange("packageCodeUz", e.target.value)
                    }
                    placeholder="—"
                    disabled={isViewMode || isBusy}
                  />
                </div>

                <div className="product-form-group">
                  <label>VAT</label>
                  <input
                    type="number"
                    step="any"
                    value={form.vat}
                    onChange={(e) => handleChange("vat", e.target.value)}
                    placeholder="0"
                    disabled={isViewMode || isBusy}
                  />
                </div>

                <div className="product-form-group">
                  <label>Weight Quantum</label>
                  <input
                    type="number"
                    step="any"
                    value={form.weightQuantum}
                    onChange={(e) =>
                      handleChange("weightQuantum", e.target.value)
                    }
                    placeholder="0"
                    disabled={isViewMode || isBusy}
                  />
                </div>

                <label className="product-form-checkbox">
                  <input
                    type="checkbox"
                    checked={form.catchWeight}
                    onChange={(e) =>
                      handleChange("catchWeight", e.target.checked)
                    }
                    disabled={isViewMode || isBusy}
                  />
                  <span>Catch Weight</span>
                </label>

                <label className="product-form-checkbox">
                  <input
                    type="checkbox"
                    checked={form.needMarking}
                    onChange={(e) =>
                      handleChange("needMarking", e.target.checked)
                    }
                    disabled={isViewMode || isBusy}
                  />
                  <span>Need Marking</span>
                </label>

                <label className="product-form-checkbox">
                  <input
                    type="checkbox"
                    checked={form.deactivated}
                    onChange={(e) =>
                      handleChange("deactivated", e.target.checked)
                    }
                    disabled={isViewMode || isBusy}
                  />
                  <span>Deactivated</span>
                </label>
              </div>
            </section>

            {error && <div className="product-form-error">{error}</div>}
          </form>
        )}

        <div className="product-modal-footer">
          <button
            type="button"
            className="product-cancel-btn"
            onClick={onClose}
          >
            {isViewMode ? "Yopish" : "Bekor qilish"}
          </button>
          {!isViewMode && (
            <button
              type="button"
              className="product-submit-btn"
              onClick={handleSubmit}
              disabled={isBusy}
            >
              {loading ? "Saqlanmoqda..." : submitLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
