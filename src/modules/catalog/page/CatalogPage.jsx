import { useCallback, useEffect, useMemo, useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
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

export default function CatalogPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  const columns = useMemo(
    () => [
      {
        key: "id",
        title: "ID",
        width: "80px",
        render: (row) => row?.id ?? "-",
      },
      {
        key: "attachment",
        title: "Rasm",
        width: "90px",
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
        title: "Nomi UZ",
        render: (row) => row?.nameUz || "-",
      },
      {
        key: "nameRu",
        title: "Nomi RU",
        render: (row) => row?.nameRu || "-",
      },
      {
        key: "nameEn",
        title: "Nomi EN",
        render: (row) => row?.nameEn || "-",
      },
      {
        key: "category",
        title: "Kategoriya",
        render: (row) => {
          const category = row?.categoryListDTO;
          return category?.id
            ? `${category.id} - ${category.name || "-"}`
            : "-";
        },
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
        key: "modifiers",
        title: "Modifierlar",
        render: (row) =>
          Array.isArray(row?.modifierGroups) && row.modifierGroups.length > 0
            ? `${row.modifierGroups.length} ta`
            : "Yo‘q",
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
          <p>Productlarni boshqarish</p>
        </div>

        <button
          type="button"
          className="catalog-primary-btn"
          onClick={handleCreateProduct}
        >
          Yangi product
        </button>
      </div>

      {error && <div className="catalog-error">{error}</div>}

      <div className="catalog-card">
        <GlobalTable
          columns={columns}
          data={products}
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
