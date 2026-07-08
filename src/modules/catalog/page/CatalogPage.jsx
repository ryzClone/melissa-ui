import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useTranslation } from "react-i18next";

import { extractPaginatedResponse } from "@/components/GlobalTable/tablePagination";

import { Pencil, Search, Trash2 } from "lucide-react";

import GlobalTable from "@/components/GlobalTable/GlobalTable";

import StatusBadge from "@/components/StatusBadge/StatusBadge";

import PageWrapper from "@/components/PageWrapper/PageWrapper";

import FilterBar, { FilterItem } from "@/components/FilterBar/FilterBar";

import CustomDropdown from "@/components/CustomDropdown/CustomDropdown";

import PagePartnerFilter from "@/components/PagePartnerFilter/PagePartnerFilter";

import { useScopedPartnerParams } from "@/hooks/useScopedPartnerParams";

import { useDebouncedValue } from "@/hooks/useDebouncedValue";

import { useLatestRequest } from "@/hooks/useLatestRequest";

import { useAuth } from "@/core/hooks/useAuth";

import { CATALOG_NAMESPACE } from "@/i18n/namespaces";

import ProductModal from "../components/ProductModal";

import { merchantProductApi } from "@/api/modules/merchantProductApi";

import { adminProductApi } from "@/api/modules/adminProductApi";

import { merchantCategoryApi } from "@/api/modules/merchantCategoryApi";

import { productApi } from "@/api/modules/productApi";

import { getAttachmentUrl } from "@/modules/products/attachmentUtils";

import {
  extractCategoriesFromCatalogResponse,
  extractCategoriesFromList,
  normalizeAdminProductList,
  normalizeMerchantProductList,
} from "../utils/catalogCategoryUtils";



import "./catalogPage.css";



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

    return { labelKey: "status.hidden", variant: "inactive" };

  }



  if (active === false) {

    return { labelKey: "status.unavailable", variant: "warning" };

  }



  return { labelKey: "status.active", variant: "active" };

}



const CATALOG_PAGE_SIZE = 20;

function sanitizeIntegerInput(raw = "") {
  return String(raw).replace(/\D/g, "");
}

function buildCatalogFilterParams({

  categoryIds,

  debouncedSearch,

  debouncedMinPrice,

  debouncedMaxPrice,

  page = 1,

  size = CATALOG_PAGE_SIZE,

}) {

  const params = {
    number: Math.max(0, Number(page) - 1),
    size: Number(size) || CATALOG_PAGE_SIZE,
  };

  const search = debouncedSearch.trim();

  if (search) {

    params.search = search;

  }

  const parsedCategoryIds = (Array.isArray(categoryIds) ? categoryIds : [])

    .map((id) => Number(id))

    .filter((id) => Number.isFinite(id));

  if (parsedCategoryIds.length) {

    params.categoryIds = parsedCategoryIds.join(",");

  }

  if (

    debouncedMinPrice !== "" &&

    Number.isFinite(Number(debouncedMinPrice))

  ) {

    params.minPrice = Number(debouncedMinPrice);

  }

  if (

    debouncedMaxPrice !== "" &&

    Number.isFinite(Number(debouncedMaxPrice))

  ) {

    params.maxPrice = Number(debouncedMaxPrice);

  }

  return params;

}



export default function CatalogPage() {

  const { t } = useTranslation(CATALOG_NAMESPACE);

  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [page, setPage] = useState(1);

  const [size, setSize] = useState(CATALOG_PAGE_SIZE);

  const [totalElements, setTotalElements] = useState(0);

  const [totalPages, setTotalPages] = useState(1);

  const { isSuperAdmin } = useAuth();

  const { canFetch, getParams, partnerId } = useScopedPartnerParams();



  const organizationId = useMemo(() => {

    if (!isSuperAdmin || !partnerId) return null;

    const id = Number(partnerId);

    return Number.isFinite(id) ? id : null;

  }, [isSuperAdmin, partnerId]);

  const filtersDisabled = isSuperAdmin && !canFetch;

  const [search, setSearch] = useState("");

  const [categoryIds, setCategoryIds] = useState([]);

  const [minPrice, setMinPrice] = useState("");

  const [maxPrice, setMaxPrice] = useState("");

  const [modifierFilter, setModifierFilter] = useState("all");

  const [categories, setCategories] = useState([]);

  const modifierFilterOptions = useMemo(
    () => [
      { value: "all", label: t("filters.modifierAll") },
      { value: "with", label: t("filters.modifierWith") },
      { value: "without", label: t("filters.modifierWithout") },
    ],
    [t]
  );



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

      buildCatalogFilterParams({

        categoryIds,

        debouncedSearch,

        debouncedMinPrice,

        debouncedMaxPrice,

        page,

        size,

      }),

    [

      categoryIds,

      debouncedSearch,

      debouncedMinPrice,

      debouncedMaxPrice,

      page,

      size,

    ]

  );



  const fetchCategories = useCallback(async () => {
    if (!canFetch || isSuperAdmin) {
      if (isSuperAdmin) {
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
  }, [canFetch, getParams, isSuperAdmin]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (!isSuperAdmin) return;

    setCategoryIds([]);
    setSearch("");
    setMinPrice("");
    setMaxPrice("");
    setModifierFilter("all");
    setCategories([]);
    setPage(1);
  }, [organizationId, isSuperAdmin]);



  const fetchProducts = useCallback(async () => {

    if (!canFetch) {

      setProducts([]);
      setTotalElements(0);
      setTotalPages(1);

      setLoading(false);

      return;

    }



    if (isSuperAdmin && organizationId == null) {

      setProducts([]);

      setCategories([]);
      setTotalElements(0);
      setTotalPages(1);

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



      const paginated = extractPaginatedResponse(res);
      let list = paginated.content;

      if (!list.length) {
        list = isSuperAdmin
          ? normalizeAdminProductList(res)
          : normalizeMerchantProductList(res);
      }

      setProducts(list);
      setTotalElements(paginated.totalElements);
      setTotalPages(paginated.totalPages);

      if (paginated.totalPages > 0 && page > paginated.totalPages) {
        setPage(paginated.totalPages);
      }

      if (isSuperAdmin) {
        setCategories(extractCategoriesFromCatalogResponse(res, list));
      }

    } catch (err) {

      if (!isLatestRequest(requestId)) return;

      console.error(err);

      setProducts([]);
      setTotalElements(0);
      setTotalPages(1);

      setError("states.loadError");

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

    page,

  ]);



  const filterKeyRef = useRef("");

  useEffect(() => {
    const nextFilterKey = [
      organizationId,
      categoryIds.join(","),
      debouncedSearch,
      debouncedMinPrice,
      debouncedMaxPrice,
    ].join("|");
    const filtersChanged = filterKeyRef.current !== nextFilterKey;
    filterKeyRef.current = nextFilterKey;

    if (filtersChanged && page !== 1) {
      setPage(1);
      return;
    }

    fetchProducts();
  }, [fetchProducts, page]);



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

      if (!window.confirm(t("confirm.deleteProductMessage"))) return;



      try {

        await productApi.delete(id);

        await fetchProducts();
      } catch {

      }

    },

    [isSuperAdmin, fetchProducts, t]

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

        title: t("table.image"),

        width: "56px",

        render: (row) => {

          const imageUrl = getAttachmentUrl(row?.attachment);



          return imageUrl ? (

            <img

              src={imageUrl}

              alt={row?.nameUz || t("image.alt")}

              className="catalog-product-img"

              onError={(e) => {

                e.currentTarget.style.display = "none";

              }}

            />

          ) : (

            <div className="catalog-product-placeholder">{t("table.noImage")}</div>

          );

        },

      },

      {

        key: "nameUz",

        title: t("table.name"),

        render: (row) => (

          <strong>{row?.nameUz || "-"}</strong>

        ),

      },

      {

        key: "descriptionUz",

        title: t("table.description"),

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

        title: t("table.category"),

        render: (row) =>

          row?.categoryListDTO?.name ? (

            <span>{row.categoryListDTO.name}</span>

          ) : (

            "-"

          ),

      },

      {

        key: "price",

        title: t("table.price"),

        render: (row) =>

          row?.price !== null && row?.price !== undefined

            ? `${Number(row.price).toLocaleString("ru-RU")} ${t("table.currency")}`

            : `0 ${t("table.currency")}`,

      },

      {

        key: "measure",

        title: t("table.measure"),

        render: (row) =>

          row?.measure !== null && row?.measure !== undefined

            ? row.measure

            : "-",

      },

      {

        key: "preparationDurationMinutes",

        title: t("table.preparation"),

        width: "96px",

        render: (row) =>

          row?.preparationDurationMinutes !== null &&

          row?.preparationDurationMinutes !== undefined

            ? t("table.minutes", { count: row.preparationDurationMinutes })

            : "-",

      },

      {

        key: "modifierGroups",

        title: t("table.modifier"),

        width: "180px",

        render: (row) => {

          const groups = Array.isArray(row?.modifierGroups)

            ? row.modifierGroups

            : [];



          if (!groups.length) {

            return <span className="gt-cell-muted">{t("table.noModifier")}</span>;

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

                      ? t("table.modifierCount", { count: group.modifiers.length })

                      : t("table.modifierCount", { count: 0 })}

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

        title: t("table.status"),

        render: (row) => {

          const status = getProductStatusBadge(row);

          return (

            <StatusBadge variant={status.variant} label={t(status.labelKey)} />

          );

        },

      },

    ],

    [t]

  );



  const paginationLabels = useMemo(
    () => ({
      total: (count) => t("pagination.total", { count }),
      perPage: t("pagination.rowsPerPage"),
      previous: t("pagination.previous"),
      next: t("pagination.next"),
      actions: t("table.actions"),
    }),
    [t]
  );



  const actions = useMemo(

    () => [

      // Vaqtinchalik: View tugmasi o'chirilgan
      // {
      //   label: "Ko'rish",
      //   icon: <Eye size={14} />,
      //   variant: "view",
      //   onClick: (row) => handleViewProduct(row),
      // },

      {

        label: t("buttons.edit"),

        icon: <Pencil size={14} />,

        variant: "edit",

        title: t("tooltips.superAdminNoPermission"),

        when: () => !isSuperAdmin,

        onClick: (row) => handleEditProduct(row),

      },

      {

        label: t("buttons.delete"),

        icon: <Trash2 size={14} />,

        variant: "delete",

        title: t("tooltips.superAdminNoPermission"),

        when: () => !isSuperAdmin,

        onClick: (row) => handleDeleteProduct(row.id),

      },

    ],

    [isSuperAdmin, handleDeleteProduct, handleEditProduct, t]

  );



  return (

    <PageWrapper className="catalog-page">

      <div className="catalog-page-top page-actions">

        <div>

          <h1>{t("title")}</h1>

          <p>{t("subtitle", { count: products.length })}</p>

        </div>



        {!isSuperAdmin && (

          <button

            type="button"

            className="catalog-primary-btn"

            onClick={handleCreateProduct}

          >

            {t("buttons.addProduct")}

          </button>

        )}

      </div>



      <FilterBar className="catalog-filter-bar">

        {isSuperAdmin && (

          <FilterItem className="catalog-filter-row-full">

            <PagePartnerFilter partnerLabel={t("filters.organization")} />

          </FilterItem>

        )}



        <div className="catalog-filter-row catalog-filter-row-prices">

          <FilterItem grow>

            <div className="catalog-filter-search">

              <Search size={16} />

              <input

                type="text"

                placeholder={t("search.placeholder")}

                value={search}

                disabled={filtersDisabled}

                onChange={(e) => setSearch(e.target.value)}

              />

            </div>

          </FilterItem>



          <FilterItem auto>

            <input

              type="text"

              inputMode="numeric"

              pattern="[0-9]*"

              className="catalog-filter-input"

              placeholder={t("filters.minPrice")}

              value={minPrice}

              disabled={filtersDisabled}

              onChange={(e) => setMinPrice(sanitizeIntegerInput(e.target.value))}

            />

          </FilterItem>



          <FilterItem auto>

            <input

              type="text"

              inputMode="numeric"

              pattern="[0-9]*"

              className="catalog-filter-input"

              placeholder={t("filters.maxPrice")}

              value={maxPrice}

              disabled={filtersDisabled}

              onChange={(e) => setMaxPrice(sanitizeIntegerInput(e.target.value))}

            />

          </FilterItem>

        </div>



        <div className="catalog-filter-row catalog-filter-row-selects">

          <FilterItem className="catalog-filter-category">

            <CustomDropdown

              className="catalog-category-dropdown"

              value={categoryIds}

              onChange={setCategoryIds}

              placeholder={t("filters.allCategories")}

              searchable

              clearable

              multiple

              disabled={filtersDisabled}

              options={categories.map((category) => ({

                label: category.name || "-",

                value: String(category.id),

              }))}

            />

          </FilterItem>



          <FilterItem className="catalog-filter-modifier">

            <CustomDropdown

              value={modifierFilter}

              onChange={setModifierFilter}

              disabled={filtersDisabled}

              options={modifierFilterOptions}

            />

          </FilterItem>

        </div>

      </FilterBar>



      {error && <div className="catalog-error">{t(error)}</div>}



      <div className="catalog-card">

        <GlobalTable

          className="global-table--compact"

          columns={columns}

          data={products}

          loading={loading}

          loadingText={t("states.loading")}

          emptyText={canFetch ? t("states.noData") : t("states.partnerSelect")}

          paginationLabels={paginationLabels}

          rowKey="id"

          actions={actions}

          pagination={{
            page,
            size,
            totalElements,
            totalPages,
          }}
          onPageChange={setPage}
          onPageSizeChange={setSize}

          // onRowDoubleClick={handleViewProduct}

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


