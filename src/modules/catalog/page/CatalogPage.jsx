import { useCallback, useEffect, useMemo, useState } from "react";
import { Eye, Pencil, Search, Trash2 } from "lucide-react";
import GlobalTable from "@/components/GlobalTable/GlobalTable";
import ProductModal from "../components/ProductModal";
import { merchantProductApi } from "@/api/modules/merchantProductApi";
import { productApi } from "@/api/modules/productApi";
import { getAttachmentUrl } from "@/modules/products/attachmentUtils";

import "./catalogPage.css";

const normalizeProductList = (res) => {
  const payload = res?.data;

  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.data?.content)) return payload.data.content;

  return [];
};

const MODIFIER_FILTERS = [
  { value: "all", label: "Barchasi" },
  { value: "with", label: "Modifier bor" },
  { value: "without", label: "Modifier yo‘q" },
];

export default function CatalogPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [modifierFilter, setModifierFilter] = useState("all");

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedProductId, setSelectedProductId] = useState(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const res = await merchantProductApi.getList();
      const list = normalizeProductList(res);

      setProducts(list);
    } catch (err) {
      console.error(err);
      setError("Productlarni yuklashda xatolik yuz berdi");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  /* ----- Unique categories from products ----- */
  const categoryOptions = useMemo(() => {
    const map = new Map();

    products.forEach((product) => {
      const category = product?.categoryListDTO;
      if (category?.id) {
        map.set(category.id, category);
      }
    });

    return Array.from(map.values());
  }, [products]);

  /* ----- Filtered products ----- */
  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();

    return products.filter((product) => {
      const searchableText = [
        product?.nameUz,
        product?.descriptionUz,
        product?.categoryListDTO?.name,
        ...(product?.modifierGroups || []).map((group) => group?.title),
        ...(product?.modifierGroups || []).flatMap((group) =>
          (group?.modifiers || []).map((modifier) => modifier?.title)
        ),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !q || searchableText.includes(q);

      const matchesCategory =
        !categoryId ||
        String(product?.categoryListDTO?.id) === String(categoryId);

      const price = Number(product?.price) || 0;
      const matchesMinPrice = minPrice === "" || price >= Number(minPrice);
      const matchesMaxPrice = maxPrice === "" || price <= Number(maxPrice);

      const hasModifiers =
        Array.isArray(product?.modifierGroups) &&
        product.modifierGroups.length > 0;

      const matchesModifier =
        modifierFilter === "all" ||
        (modifierFilter === "with" && hasModifiers) ||
        (modifierFilter === "without" && !hasModifiers);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesMinPrice &&
        matchesMaxPrice &&
        matchesModifier
      );
    });
  }, [products, search, categoryId, minPrice, maxPrice, modifierFilter]);

  /* ----- Modal handlers ----- */
  const handleViewProduct = (id) => {
    setSelectedProductId(id);
    setModalMode("view");
    setIsProductModalOpen(true);
  };

  const handleEditProduct = (id) => {
    setSelectedProductId(id);
    setModalMode("edit");
    setIsProductModalOpen(true);
  };

  const handleCreateProduct = () => {
    setSelectedProductId(null);
    setModalMode("create");
    setIsProductModalOpen(true);
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Productni o‘chirmoqchimisiz?")) return;

    try {
      await productApi.delete(id);
      await fetchProducts();
    } catch (err) {
      console.error(err);
      setError("Productni o‘chirishda xatolik yuz berdi");
    }
  };

  /* ----- Columns ----- */
  const columns = useMemo(
    () => [
      {
        key: "id",
        title: "ID",
        width: "70px",
        render: (row) => row?.id ?? "-",
      },
      {
        key: "attachment",
        title: "Rasm",
        width: "80px",
        render: (row) => {
          const imageUrl = getAttachmentUrl(row?.attachment);

          return imageUrl ? (
            <img
              src={imageUrl}
              alt={row?.nameUz || "product"}
              className="catalog-product-img"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="catalog-product-placeholder">No image</div>
          );
        },
      },
      {
        key: "nameUz",
        title: "Nomi",
        render: (row) => (
          <div className="catalog-product-main">
            <strong>{row?.nameUz || "-"}</strong>
            <span>ID: {row?.id ?? "-"}</span>
          </div>
        ),
      },
      {
        key: "descriptionUz",
        title: "Tavsif",
        render: (row) => (
          <span
            className="catalog-description-cell"
            title={row?.descriptionUz || ""}
          >
            {row?.descriptionUz || "-"}
          </span>
        ),
      },
      {
        key: "categoryListDTO",
        title: "Kategoriya",
        render: (row) =>
          row?.categoryListDTO ? (
            <div className="catalog-dto-chip">
              <span>#{row.categoryListDTO.id}</span>
              <b>{row.categoryListDTO.name || "-"}</b>
            </div>
          ) : (
            "-"
          ),
      },
      {
        key: "price",
        title: "Narxi",
        render: (row) =>
          row?.price !== null && row?.price !== undefined
            ? `${Number(row.price).toLocaleString("ru-RU")} so'm`
            : "0 so'm",
      },
      {
        key: "measure",
        title: "O‘lchov",
        render: (row) =>
          row?.measure !== null && row?.measure !== undefined
            ? row.measure
            : "-",
      },
      {
        key: "preparationDurationMinutes",
        title: "Tayyorlanish",
        render: (row) =>
          row?.preparationDurationMinutes !== null &&
          row?.preparationDurationMinutes !== undefined
            ? `${row.preparationDurationMinutes} daqiqa`
            : "-",
      },
      {
        key: "modifierGroups",
        title: "Modifier Groups",
        render: (row) => {
          const groups = Array.isArray(row?.modifierGroups)
            ? row.modifierGroups
            : [];

          if (!groups.length) {
            return <span className="catalog-muted">Yo‘q</span>;
          }

          return (
            <div className="catalog-modifier-list">
              {groups.slice(0, 2).map((group) => (
                <div
                  key={group?.id ?? group?.title}
                  className="catalog-modifier-chip"
                >
                  <span>{group?.title || `Group #${group?.id}`}</span>
                  <small>
                    {Array.isArray(group?.modifiers)
                      ? `${group.modifiers.length} modifier`
                      : "0 modifier"}
                  </small>
                </div>
              ))}

              {groups.length > 2 && (
                <div className="catalog-modifier-more">
                  +{groups.length - 2}
                </div>
              )}
            </div>
          );
        },
      },
    ],
    []
  );

  const renderActions = (row) => (
    <>
      <button
        type="button"
        className="global-table-action-btn view"
        onClick={() => handleViewProduct(row.id)}
        title="Ko‘rish"
      >
        <Eye size={15} />
      </button>

      <button
        type="button"
        className="global-table-action-btn edit"
        onClick={() => handleEditProduct(row.id)}
        title="Tahrirlash"
      >
        <Pencil size={15} />
      </button>

      <button
        type="button"
        className="global-table-action-btn delete"
        onClick={() => handleDeleteProduct(row.id)}
        title="O‘chirish"
      >
        <Trash2 size={15} />
      </button>
    </>
  );

  return (
    <div className="catalog-page">
      <div className="catalog-page-top">
        <div>
          <h1>Catalog</h1>
          <p>Productlarni boshqarish ({filteredProducts.length})</p>
        </div>

        <button
          type="button"
          className="catalog-primary-btn"
          onClick={handleCreateProduct}
        >
          Yangi product
        </button>
      </div>

      {/* ----- Filters ----- */}
      <div className="catalog-filters">
        <div className="catalog-filter-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Nomi, tavsif, kategoriya, modifier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="catalog-filter-input"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          <option value="">Barcha kategoriyalar</option>
          {categoryOptions.map((category) => (
            <option key={category.id} value={category.id}>
              {category.id} - {category.name || "-"}
            </option>
          ))}
        </select>

        <input
          type="number"
          className="catalog-filter-input"
          placeholder="Min narx"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
        />

        <input
          type="number"
          className="catalog-filter-input"
          placeholder="Max narx"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />

        <select
          className="catalog-filter-input"
          value={modifierFilter}
          onChange={(e) => setModifierFilter(e.target.value)}
        >
          {MODIFIER_FILTERS.map((filter) => (
            <option key={filter.value} value={filter.value}>
              {filter.label}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="catalog-error">{error}</div>}

      <div className="catalog-card">
        <GlobalTable
          columns={columns}
          data={filteredProducts}
          loading={loading}
          emptyText="Productlar topilmadi"
          rowKey="id"
          renderActions={renderActions}
          onRowDoubleClick={(row) => handleViewProduct(row.id)}
        />
      </div>

      <ProductModal
        isOpen={isProductModalOpen}
        mode={modalMode}
        productId={selectedProductId}
        onClose={() => setIsProductModalOpen(false)}
        onSuccess={fetchProducts}
      />
    </div>
  );
}
