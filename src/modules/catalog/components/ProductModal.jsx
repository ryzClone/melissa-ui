import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, ImagePlus, Trash2, X } from "lucide-react";
import { useScopedPartnerParams } from "@/hooks/useScopedPartnerParams";
import { useAuth } from "@/core/hooks/useAuth";
import { CATALOG_NAMESPACE } from "@/i18n/namespaces";
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

  visible: true,
  active: true,
};

const str = (value) => (value != null ? String(value) : "");

function mapProductPayloadToForm(payload = {}) {
  const attr = payload.productAttribute || {};

  return {
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

    visible: resolveBooleanField(payload, ["visible", "isVisible"], true),
    active: resolveBooleanField(
      payload,
      ["active", "isActive", "enabled"],
      true
    ),
  };
}

function resolveBooleanField(source = {}, keys = [], defaultValue = true) {
  for (const key of keys) {
    if (source[key] !== undefined && source[key] !== null) {
      return Boolean(source[key]);
    }
  }
  return defaultValue;
}

function ProductToggleSwitch({ label, description, checked, disabled, onChange }) {
  return (
    <div className={`product-toggle-card ${disabled ? "is-disabled" : ""}`}>
      <div className="product-toggle-copy">
        <strong>{label}</strong>
        {description ? <p>{description}</p> : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        className={`product-switch ${checked ? "active" : ""}`}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
      >
        <span className="product-switch-thumb" />
      </button>
    </div>
  );
}

/* ---------- Category dropdown ---------- */

function CategoryDropdown({ value, options, loading, disabled, onChange }) {
  const { t } = useTranslation(CATALOG_NAMESPACE);
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
    ? selected.name
    : loading
      ? t("states.loading")
      : t("placeholders.category");

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
            <li className="pm-custom-select-empty">{t("states.noCategories")}</li>
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
                  {category.name}
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
  initialProduct = null,
  onClose,
  onSuccess,
}) {
  const { t } = useTranslation(CATALOG_NAMESPACE);
  const { isSuperAdmin } = useAuth();
  const { canFetch, getParams } = useScopedPartnerParams();
  const [form, setForm] = useState(initialForm);
  const [imagePreview, setImagePreview] = useState(null);

  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const [branches, setBranches] = useState([]);
  const [branchesLoading, setBranchesLoading] = useState(false);

  const fileInputRef = useRef(null);

  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";
  const isCreateMode = mode === "create";
  const isBusy = loading || uploadingImage;

  /* ----- Categories: load once when modal opens ----- */
  const fetchCategories = useCallback(async () => {
    if (!canFetch || isSuperAdmin) {
      if (isSuperAdmin) setCategories([]);
      return;
    }

    try {
      setCategoriesLoading(true);
      const res = await merchantCategoryApi.getAll(getParams());
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
            category.name || category.title || "Kategoriya",
        }))
      );
    } catch (err) {
      console.error(err);
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  }, [canFetch, getParams, isSuperAdmin]);

  useEffect(() => {
    if (!isOpen || isSuperAdmin) return;
    fetchCategories();
  }, [isOpen, fetchCategories, isSuperAdmin]);

  /* ----- Branches: load once when modal opens ----- */
  const fetchBranches = useCallback(async () => {
    if (!canFetch || isSuperAdmin) {
      if (isSuperAdmin) setBranches([]);
      return;
    }

    try {
      setBranchesLoading(true);
      const res = await merchantProductApi.getBranchList(getParams());
      const payload = res?.data;

      const list =
        (Array.isArray(payload?.data) && payload.data) ||
        (Array.isArray(payload?.content) && payload.content) ||
        (Array.isArray(payload) && payload) ||
        [];

      setBranches(list);
    } catch (err) {
      console.error(err);
      setBranches([]);
    } finally {
      setBranchesLoading(false);
    }
  }, [canFetch, getParams, isSuperAdmin]);

  useEffect(() => {
    if (!isOpen || isSuperAdmin) return;
    fetchBranches();
  }, [isOpen, fetchBranches, isSuperAdmin]);

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

  const applyProductToForm = useCallback((payload) => {
    setForm(mapProductPayloadToForm(payload));
    setImagePreview(getAttachmentUrl(payload?.attachment));
    setError("");
  }, []);

  /* ----- Edit/View detail load ----- */
  const loadProductDetail = useCallback(async () => {
    if (!productId || mode === "create") return;
    if (!canFetch) return;

    if (mode === "view" && initialProduct) {
      applyProductToForm(initialProduct);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = isSuperAdmin
        ? await productApi.getById(productId)
        : await merchantProductApi.getById(productId, getParams());
      const payload = res?.data?.data || res?.data || null;

      if (!payload) {
        throw new Error("productNotFound");
      }

      applyProductToForm(payload);
    } catch (err) {
      console.error(err);
      setError(
        err?.message === "productNotFound"
          ? t("states.productNotFound")
          : t("states.productLoadError")
      );
    } finally {
      setLoading(false);
    }
  }, [
    productId,
    mode,
    canFetch,
    getParams,
    isSuperAdmin,
    initialProduct,
    applyProductToForm,
    t,
  ]);

  useEffect(() => {
    if (!isOpen) return;
    if (mode === "edit" || mode === "view") {
      loadProductDetail();
    }
  }, [isOpen, mode, loadProductDetail, initialProduct]);

  useEffect(() => {
    if (!isOpen || !isSuperAdmin || !initialProduct) return;

    const cat = initialProduct.categoryListDTO;
    if (cat?.id) {
      setCategories([
        {
          id: cat.id,
          name: cat.name || cat.title || "Kategoriya",
        },
      ]);
    }

    if (Array.isArray(initialProduct.branches)) {
      setBranches(initialProduct.branches);
    }
  }, [isOpen, isSuperAdmin, initialProduct]);

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
    setForm((prev) => {
      if (key === "visible" && !value) {
        return { ...prev, visible: false, active: false };
      }

      return { ...prev, [key]: value };
    });
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError(t("validation.imageOnly"));
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
        setError(t("validation.attachmentIdMissing"));
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
          t("validation.imageUploadError")
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
    visible: Boolean(form.visible),
    active: Boolean(form.active),
  });

  /* ----- Submit ----- */

  const handleSubmit = async (event) => {
    if (event?.preventDefault) event.preventDefault();
    if (isViewMode || isSuperAdmin) return;

    if (uploadingImage) {
      setError(t("validation.waitForUpload"));
      return;
    }

    if (!form.nameUz.trim()) {
      setError(t("validation.nameUzRequired"));
      return;
    }

    if (!form.categoryId) {
      setError(t("validation.selectCategory"));
      return;
    }

    if (form.price === "" || Number(form.price) < 0) {
      setError(t("validation.invalidPrice"));
      return;
    }

    try {
      setLoading(true);
      setError("");

      const payload = buildProductPayload();

      if (isEditMode) {
        await productApi.update(productId, payload);
      } else {
        await productApi.create(payload);
      }

      await onSuccess?.();
      onClose?.();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ----- Render ----- */

  const headerTitle = isCreateMode
    ? t("modal.createProduct")
    : isEditMode
      ? t("modal.editProduct")
      : t("modal.viewProduct");

  const submitLabel = isCreateMode ? t("buttons.createProduct") : t("buttons.save");

  return (
    <div className="product-modal-overlay" onClick={onClose}>
      <div
        className="product-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="product-modal-header">
          <div>
            <div className="product-modal-kicker">{t("modal.kicker")}</div>
            <h2>{headerTitle}</h2>
          </div>
          <button
            type="button"
            className="product-modal-close"
            onClick={onClose}
            title={t("buttons.close")}
          >
            <X size={18} />
          </button>
        </div>

        {loading && !isCreateMode && !form.nameUz && !form.nameRu ? (
          <div className="product-modal-loading">
            {t("states.loading")}
          </div>
        ) : (
          <form className="product-modal-body" onSubmit={handleSubmit}>
            {/* ===== Asosiy ma'lumotlar ===== */}
            <section className="product-section">
              <h3 className="product-section-title">{t("form.basicInfo")}</h3>
              <div className="product-form-grid">
                <div className="product-form-group product-form-full">
                  <label>{t("form.category")} *</label>
                  <CategoryDropdown
                    value={form.categoryId}
                    options={categories}
                    loading={categoriesLoading}
                    disabled={isViewMode || isBusy}
                    onChange={(value) => handleChange("categoryId", value)}
                  />
                </div>

                <div className="product-form-group">
                  <label>{t("form.nameUz")} *</label>
                  <input
                    type="text"
                    value={form.nameUz}
                    onChange={(e) => handleChange("nameUz", e.target.value)}
                    placeholder={t("placeholders.name")}
                    disabled={isViewMode || isBusy}
                  />
                </div>

                <div className="product-form-group">
                  <label>{t("form.nameRu")}</label>
                  <input
                    type="text"
                    value={form.nameRu}
                    onChange={(e) => handleChange("nameRu", e.target.value)}
                    placeholder={t("placeholders.nameRu")}
                    disabled={isViewMode || isBusy}
                  />
                </div>

                <div className="product-form-group">
                  <label>{t("form.nameEn")}</label>
                  <input
                    type="text"
                    value={form.nameEn}
                    onChange={(e) => handleChange("nameEn", e.target.value)}
                    placeholder={t("placeholders.nameEn")}
                    disabled={isViewMode || isBusy}
                  />
                </div>

                <div className="product-form-group">
                  <label>{t("form.price")} *</label>
                  <input
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={(e) => handleChange("price", e.target.value)}
                    placeholder={t("placeholders.price")}
                    disabled={isViewMode || isBusy}
                  />
                </div>
              </div>
            </section>

            {/* ===== Rasm ===== */}
            <section className="product-section">
              <h3 className="product-section-title">{t("form.image")}</h3>
              <div className="product-image-upload-card">
                <div className="product-image-preview">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt={t("image.alt")}
                      onError={() => {
                        console.error("Image load failed:", imagePreview);
                        setImagePreview(null);
                      }}
                    />
                  ) : (
                    <div className="product-image-placeholder">
                      <ImagePlus size={28} />
                      <span>{t("image.noImage")}</span>
                    </div>
                  )}
                </div>

                <div className="product-image-info">
                  <h4>{t("form.productImage")}</h4>
                  <p>{t("image.hint")}</p>

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
                          ? t("states.loading")
                          : imagePreview
                            ? t("buttons.changeImage")
                            : t("buttons.selectImage")}
                      </button>

                      {imagePreview && (
                        <button
                          type="button"
                          className="product-image-remove-btn"
                          onClick={handleRemoveImage}
                          disabled={uploadingImage}
                        >
                          <Trash2 size={14} />
                          <span>{t("buttons.removeImage")}</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* ===== Tavsiflar ===== */}
            <section className="product-section">
              <h3 className="product-section-title">{t("form.descriptions")}</h3>
              <div className="product-form-grid">
                <div className="product-form-group product-form-full">
                  <label>{t("form.descriptionUz")}</label>
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
                  <label>{t("form.descriptionRu")}</label>
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
                  <label>{t("form.descriptionEn")}</label>
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
              <h3 className="product-section-title">{t("form.attributes")}</h3>
              <div className="product-form-grid">
                <div className="product-form-group">
                  <label>{t("attributes.measure")}</label>
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
                  <label>{t("attributes.measureUnit")}</label>
                  <input
                    type="text"
                    value={form.measureUnit}
                    onChange={(e) =>
                      handleChange("measureUnit", e.target.value)
                    }
                    placeholder={t("placeholders.measureUnit")}
                    disabled={isViewMode || isBusy}
                  />
                </div>

                <div className="product-form-group">
                  <label>{t("attributes.calories")}</label>
                  <input
                    type="text"
                    value={form.calories}
                    onChange={(e) => handleChange("calories", e.target.value)}
                    placeholder="—"
                    disabled={isViewMode || isBusy}
                  />
                </div>

                <div className="product-form-group">
                  <label>{t("attributes.carbohydrates")}</label>
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
                  <label>{t("attributes.fat")}</label>
                  <input
                    type="text"
                    value={form.fat}
                    onChange={(e) => handleChange("fat", e.target.value)}
                    placeholder="—"
                    disabled={isViewMode || isBusy}
                  />
                </div>

                <div className="product-form-group">
                  <label>{t("attributes.proteins")}</label>
                  <input
                    type="text"
                    value={form.proteins}
                    onChange={(e) => handleChange("proteins", e.target.value)}
                    placeholder="—"
                    disabled={isViewMode || isBusy}
                  />
                </div>

                <div className="product-form-group">
                  <label>{t("attributes.mxikCode")}</label>
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
                  <label>{t("attributes.packageCode")}</label>
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
                  <label>{t("attributes.vat")}</label>
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
                  <label>{t("attributes.weightQuantum")}</label>
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

                <div className="product-checkbox-grid">
                  <label className="product-form-checkbox">
                    <input
                      type="checkbox"
                      checked={form.catchWeight}
                      onChange={(e) =>
                        handleChange("catchWeight", e.target.checked)
                      }
                      disabled={isViewMode || isBusy}
                    />
                    <span>{t("attributes.catchWeight")}</span>
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
                    <span>{t("attributes.needMarking")}</span>
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
                    <span>{t("attributes.deactivated")}</span>
                  </label>
                </div>
              </div>
            </section>

            {/* ===== Filiallar ===== */}
            <section className="product-form-section">
              <div className="product-section-header">
                <h3>{t("form.branches")}</h3>
                <p>{t("form.branchesHint")}</p>
              </div>

              {branchesLoading ? (
                <div className="product-branch-empty">
                  {t("states.branchesLoading")}
                </div>
              ) : branches.length === 0 ? (
                <div className="product-branch-empty">
                  {t("states.noBranches")}
                </div>
              ) : (
                <div className="product-branch-grid">
                  {branches.map((branch) => {
                    const branchId = Number(branch.id);
                    const checked = form.branchIds
                      .map(Number)
                      .includes(branchId);

                    const branchName =
                      branch.name ||
                      branch.title ||
                      branch.nameUz ||
                      "Filial";

                    return (
                      <label
                        key={branch.id}
                        className={`product-branch-card ${
                          checked ? "active" : ""
                        } ${isViewMode ? "disabled" : ""}`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={isViewMode || isBusy}
                          onChange={() => {
                            setForm((prev) => {
                              const current = prev.branchIds.map(Number);
                              const exists = current.includes(branchId);
                              return {
                                ...prev,
                                branchIds: exists
                                  ? current.filter((id) => id !== branchId)
                                  : [...current, branchId],
                              };
                            });
                          }}
                        />

                        <div className="product-branch-info">
                          <strong>{branchName}</strong>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </section>

            {!isViewMode && (
              <section className="product-status-section">
                <h3 className="product-status-title">{t("form.visibilityAndSale")}</h3>
                <div className="product-switch-grid">
                  <ProductToggleSwitch
                    label={t("form.show")}
                    description={t("form.showHint")}
                    checked={Boolean(form.visible)}
                    disabled={isBusy}
                    onChange={(value) => handleChange("visible", value)}
                  />
                  <ProductToggleSwitch
                    label={t("form.openForSale")}
                    description={t("form.openForSaleHint")}
                    checked={Boolean(form.active)}
                    disabled={isBusy || !form.visible}
                    onChange={(value) => handleChange("active", value)}
                  />
                </div>
              </section>
            )}

            {isViewMode && (
              <section className="product-status-section">
                <h3 className="product-status-title">{t("form.visibilityAndSale")}</h3>
                <div className="product-switch-grid">
                  <ProductToggleSwitch
                    label={t("form.show")}
                    description={t("form.showHint")}
                    checked={Boolean(form.visible)}
                    disabled
                    onChange={() => {}}
                  />
                  <ProductToggleSwitch
                    label={t("form.openForSale")}
                    description={t("form.openForSaleHint")}
                    checked={Boolean(form.active)}
                    disabled
                    onChange={() => {}}
                  />
                </div>
              </section>
            )}

            {error && <div className="product-form-error">{error}</div>}
          </form>
        )}

        <div className="product-modal-footer">
          <button
            type="button"
            className="product-cancel-btn"
            onClick={onClose}
          >
            {isViewMode ? t("buttons.close") : t("buttons.cancel")}
          </button>
          {!isViewMode && (
            <button
              type="button"
              className="product-submit-btn"
              onClick={handleSubmit}
              disabled={isBusy}
            >
              {loading ? t("states.saving") : submitLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
