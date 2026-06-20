import { useCallback, useEffect, useMemo, useState } from "react";

import { Eye, Pencil, Search, Trash2 } from "lucide-react";

import GlobalTable from "@/components/GlobalTable/GlobalTable";

import StatusBadge from "@/components/StatusBadge/StatusBadge";

import PageWrapper from "@/components/PageWrapper/PageWrapper";

import FilterBar, { FilterItem } from "@/components/FilterBar/FilterBar";

import CustomDropdown from "@/components/CustomDropdown/CustomDropdown";

import PagePartnerFilter from "@/components/PagePartnerFilter/PagePartnerFilter";

import { useScopedPartnerParams, PARTNER_SELECT_MESSAGE } from "@/hooks/useScopedPartnerParams";

import { useDebouncedValue } from "@/hooks/useDebouncedValue";

import { useLatestRequest } from "@/hooks/useLatestRequest";

import { useAuth } from "@/core/hooks/useAuth";

import { useGlobalNotification } from "@/hooks/useGlobalNotification";

import ProductModal from "../components/ProductModal";

import { merchantProductApi } from "@/api/modules/merchantProductApi";

import { adminProductApi } from "@/api/modules/adminProductApi";

import { merchantCategoryApi } from "@/api/modules/merchantCategoryApi";

import { productApi } from "@/api/modules/productApi";

import { buildListParams } from "@/utils/buildListParams";

import { getAttachmentUrl } from "@/modules/products/attachmentUtils";

import {
  extractCategoriesFromList,
  normalizeAdminProductList,
  normalizeMerchantProductList,
} from "../utils/catalogCategoryUtils";



import "./catalogPage.css";



const MODIFIER_FILTERS = [

  { value: "all", label: "Barchasi" },

  { value: "with", label: "Modifier bor" },

  { value: "without", label: "Modifier yo‘q" },

];



function resolveRowBoolean(row = {}, keys = [], defaultValue = true) {

  for (const key of keys) {

    const value = row[key];

    if (value === undefined || value === null) continue;

    if (typeof value === "boolean") return value;

    if (typeof value === "number") return value !== 0;

    if (typeof value === "string") {

      const normalized = value.trim().toLowerCase();

      if (normalized === "true" || normalized === "1") return true;

      if (normalized === "false" || normalized === "0") return false;

    }

  }

  return defaultValue;

}



function getProductStatusBadge(row = {}) {

  const visible = resolveRowBoolean(row, ["visible", "isVisible"], true);

  const active = resolveRowBoolean(

    row,

    ["active", "isActive", "enabled"],

    true

  );



  if (visible === false) {

    return { label: "Yashirilgan", variant: "inactive" };

  }



  if (active === false) {

    return { label: "Sotuv yopiq", variant: "warning" };

  }



  return { label: "Aktiv", variant: "active" };

}



function buildCatalogApiFilters({

  categoryId,

  modifierFilter,

  debouncedSearch,

  debouncedMinPrice,

  debouncedMaxPrice,

}) {

  return buildListParams({

    page: 0,

    size: 100,

    categoryId: categoryId ? Number(categoryId) : undefined,

    search: debouncedSearch.trim() || undefined,

    minPrice: debouncedMinPrice !== "" ? Number(debouncedMinPrice) : undefined,

    maxPrice: debouncedMaxPrice !== "" ? Number(debouncedMaxPrice) : undefined,

    modifier:

      modifierFilter === "with"

        ? true

        : modifierFilter === "without"

          ? false

          : undefined,

  });

}



export default function CatalogPage() {

  const { success } = useGlobalNotification();

  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const { isSuperAdmin } = useAuth();

  const { canFetch, getParams, getOrganizationParams, partnerId } =
    useScopedPartnerParams();



  const organizationId = useMemo(() => {

    if (!isSuperAdmin || !partnerId) return null;

    const id = Number(partnerId);

    return Number.isFinite(id) ? id : null;

  }, [isSuperAdmin, partnerId]);



  const [search, setSearch] = useState("");

  const [categoryId, setCategoryId] = useState("");

  const [minPrice, setMinPrice] = useState("");

  const [maxPrice, setMaxPrice] = useState("");

  const [modifierFilter, setModifierFilter] = useState("all");

  const [categories, setCategories] = useState([]);



  const debouncedSearch = useDebouncedValue(search, 3000);

  const debouncedMinPrice = useDebouncedValue(minPrice, 3000);

  const debouncedMaxPrice = useDebouncedValue(maxPrice, 3000);

  const { beginRequest, isLatestRequest } = useLatestRequest();



  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const [modalMode, setModalMode] = useState("create");

  const [selectedProductId, setSelectedProductId] = useState(null);

  const [selectedProduct, setSelectedProduct] = useState(null);



  const apiFilters = useMemo(

    () =>

      buildCatalogApiFilters({

        categoryId,

        modifierFilter,

        debouncedSearch,

        debouncedMinPrice,

        debouncedMaxPrice,

      }),

    [

      categoryId,

      modifierFilter,

      debouncedSearch,

      debouncedMinPrice,

      debouncedMaxPrice,

    ]

  );



  const fetchCategories = useCallback(async () => {
    if (!canFetch) {
      setCategories([]);
      return;
    }

    if (isSuperAdmin) {
      if (organizationId == null) {
        setCategories([]);
        return;
      }

      try {
        const res = await merchantCategoryApi.getAll(getOrganizationParams());
        const payload = res?.data;
        const list = Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload)
            ? payload
            : [];

        setCategories(
          extractCategoriesFromList(
            list.map((category) => ({
              id: category.id,
              name: category.name || category.title || "Kategoriya",
            }))
          )
        );
      } catch (err) {
        console.error(err);
        setCategories([]);
      }

      return;
    }

    try {
      const res = await merchantCategoryApi.getAll(getParams());
      const payload = res?.data;
      const list = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload)
          ? payload
          : [];

      setCategories(
        extractCategoriesFromList(
          list.map((category) => ({
            id: category.id,
            name: category.name || category.title || "Kategoriya",
          }))
        )
      );
    } catch (err) {
      console.error(err);
      setCategories([]);
    }
  }, [
    canFetch,
    getParams,
    getOrganizationParams,
    isSuperAdmin,
    organizationId,
  ]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (!isSuperAdmin) return;
    setCategoryId("");
  }, [organizationId, isSuperAdmin]);



  const fetchProducts = useCallback(async () => {

    if (!canFetch) {

      setProducts([]);

      setLoading(false);

      return;

    }



    if (isSuperAdmin && organizationId == null) {

      setProducts([]);

      setLoading(false);

      return;

    }



    const requestId = beginRequest();



    try {

      setLoading(true);

      setError("");



      const res = isSuperAdmin

        ? await adminProductApi.getByOrganization(organizationId, apiFilters)

        : await merchantProductApi.getList(getParams(apiFilters));



      if (!isLatestRequest(requestId)) return;



      const list = isSuperAdmin
        ? normalizeAdminProductList(res)
        : normalizeMerchantProductList(res);

      setProducts(list);

    } catch (err) {

      if (!isLatestRequest(requestId)) return;

      console.error(err);

      setProducts([]);

      setError("Productlarni yuklashda xatolik yuz berdi");

    } finally {

      if (isLatestRequest(requestId)) {

        setLoading(false);

      }

    }

  }, [

    canFetch,

    isSuperAdmin,

    organizationId,

    apiFilters,

    getParams,

    beginRequest,

    isLatestRequest,

  ]);



  useEffect(() => {

    fetchProducts();

  }, [fetchProducts]);



  const handleViewProduct = useCallback(

    (row) => {

      if (!row) return;



      setSelectedProductId(row.id ?? null);

      setSelectedProduct(isSuperAdmin ? row : null);

      setModalMode("view");

      setIsProductModalOpen(true);

    },

    [isSuperAdmin]

  );



  const handleEditProduct = useCallback(

    (row) => {

      if (isSuperAdmin) return;



      setSelectedProduct(null);

      setSelectedProductId(row?.id ?? row);

      setModalMode("edit");

      setIsProductModalOpen(true);

    },

    [isSuperAdmin]

  );



  const handleCreateProduct = useCallback(() => {

    if (isSuperAdmin) return;



    setSelectedProduct(null);

    setSelectedProductId(null);

    setModalMode("create");

    setIsProductModalOpen(true);

  }, [isSuperAdmin]);



  const handleDeleteProduct = useCallback(

    async (id) => {

      if (isSuperAdmin) return;

      if (!window.confirm("Productni o‘chirmoqchimisiz?")) return;



      try {

        await productApi.delete(id);

        await fetchProducts();

        success("Muvaffaqiyatli o'chirildi");

      } catch (err) {

        console.error(err);

      }

    },

    [isSuperAdmin, fetchProducts, success]

  );



  const handleCloseProductModal = useCallback(() => {

    setIsProductModalOpen(false);

    setSelectedProduct(null);

    setSelectedProductId(null);

  }, []);



  /* ----- Columns ----- */

  const columns = useMemo(

    () => [

      {

        key: "attachment",

        title: "Rasm",

        width: "56px",

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

          <strong>{row?.nameUz || "-"}</strong>

        ),

      },

      {

        key: "descriptionUz",

        title: "Tavsif",

        width: "160px",

        className: "description-cell",

        render: (row) => (

          <span title={row?.descriptionUz || ""}>

            {row?.descriptionUz || "-"}

          </span>

        ),

      },

      {

        key: "categoryListDTO",

        title: "Kategoriya",

        render: (row) =>

          row?.categoryListDTO?.name ? (

            <span>{row.categoryListDTO.name}</span>

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

        width: "96px",

        render: (row) =>

          row?.preparationDurationMinutes !== null &&

          row?.preparationDurationMinutes !== undefined

            ? `${row.preparationDurationMinutes} daqiqa`

            : "-",

      },

      {

        key: "modifierGroups",

        title: "Modifier",

        width: "180px",

        render: (row) => {

          const groups = Array.isArray(row?.modifierGroups)

            ? row.modifierGroups

            : [];



          if (!groups.length) {

            return <span className="gt-cell-muted">Yo‘q</span>;

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

      {

        key: "productStatus",

        title: "Holat",

        render: (row) => {

          const status = getProductStatusBadge(row);

          return (

            <StatusBadge variant={status.variant} label={status.label} />

          );

        },

      },

    ],

    []

  );



  const actions = useMemo(

    () => [

      {

        label: "Ko'rish",

        icon: <Eye size={14} />,

        variant: "view",

        onClick: (row) => handleViewProduct(row),

      },

      {

        label: "Tahrirlash",

        icon: <Pencil size={14} />,

        variant: "edit",

        title: "Super Admin uchun ruxsat yo'q",

        when: () => !isSuperAdmin,

        onClick: (row) => handleEditProduct(row),

      },

      {

        label: "O'chirish",

        icon: <Trash2 size={14} />,

        variant: "delete",

        title: "Super Admin uchun ruxsat yo'q",

        when: () => !isSuperAdmin,

        onClick: (row) => handleDeleteProduct(row.id),

      },

    ],

    [isSuperAdmin, handleDeleteProduct, handleEditProduct, handleViewProduct]

  );



  return (

    <PageWrapper className="catalog-page">

      <div className="catalog-page-top page-actions">

        <div>

          <h1>Catalog</h1>

          <p>Productlarni boshqarish ({products.length})</p>

        </div>



        {!isSuperAdmin && (

          <button

            type="button"

            className="catalog-primary-btn"

            onClick={handleCreateProduct}

          >

            Yangi product

          </button>

        )}

      </div>



      <FilterBar>

        {isSuperAdmin && (

          <FilterItem>

            <PagePartnerFilter partnerLabel="Tashkilot" />

          </FilterItem>

        )}



        <FilterItem grow>

          <div className="catalog-filter-search">

            <Search size={16} />

            <input

              type="text"

              placeholder="Nomi, tavsif, kategoriya, modifier..."

              value={search}

              onChange={(e) => setSearch(e.target.value)}

            />

          </div>

        </FilterItem>



        <FilterItem>

          <CustomDropdown

            value={categoryId}

            onChange={setCategoryId}

            placeholder="Barcha kategoriyalar"

            searchable

            clearable

            options={[

              { label: "Barcha kategoriyalar", value: "" },

              ...categories.map((category) => ({

                label: category.name || "-",

                value: String(category.id),

              })),

            ]}

          />

        </FilterItem>



        <FilterItem auto>

          <input

            type="number"

            className="catalog-filter-input"

            placeholder="Min narx"

            value={minPrice}

            onChange={(e) => setMinPrice(e.target.value)}

          />

        </FilterItem>



        <FilterItem auto>

          <input

            type="number"

            className="catalog-filter-input"

            placeholder="Max narx"

            value={maxPrice}

            onChange={(e) => setMaxPrice(e.target.value)}

          />

        </FilterItem>



        <FilterItem>

          <CustomDropdown

            value={modifierFilter}

            onChange={setModifierFilter}

            options={MODIFIER_FILTERS}

          />

        </FilterItem>

      </FilterBar>



      {error && <div className="catalog-error">{error}</div>}



      <div className="catalog-card">

        <GlobalTable

          className="global-table--compact"

          columns={columns}

          data={products}

          loading={loading}

          emptyText={canFetch ? "Productlar topilmadi" : PARTNER_SELECT_MESSAGE}

          rowKey="id"

          actions={actions}

          pagination={{ client: true }}

          onRowDoubleClick={handleViewProduct}

        />

      </div>



      <ProductModal

        isOpen={isProductModalOpen}

        mode={modalMode}

        productId={selectedProductId}

        initialProduct={selectedProduct}

        onClose={handleCloseProductModal}

        onSuccess={fetchProducts}

      />

    </PageWrapper>

  );

}


