const BRANCH_FIELD_KEYS = [
  "formattedAddress",
  "address",
  "phoneNumber",
  "phone",
  "branchId",
  "organizationBranchId",
  "organizationName",
  "partnerName",
  "merchantName",
  "latitude",
  "longitude",
];

function isBranchLikeEntity(item = {}) {
  if (!item || typeof item !== "object" || Array.isArray(item)) {
    return false;
  }

  return BRANCH_FIELD_KEYS.some((key) => item[key] != null && item[key] !== "");
}

function isProductRow(row = {}) {
  if (!row || typeof row !== "object" || Array.isArray(row)) {
    return false;
  }

  return (
    row.nameUz != null ||
    row.nameRu != null ||
    row.nameEn != null ||
    row.price != null ||
    row.modifierGroups != null ||
    row.preparationDurationMinutes != null ||
    row.attachment != null ||
    row.descriptionUz != null
  );
}

function normalizeCategoryOption(item = {}) {
  if (!item || typeof item !== "object" || Array.isArray(item)) {
    return null;
  }

  if (isBranchLikeEntity(item)) {
    return null;
  }

  const id = item.id ?? item.categoryId;
  if (id == null || id === "") {
    return null;
  }

  const name =
    item.name ||
    item.title ||
    item.categoryName ||
    item.nameUz ||
    item.nameRu;

  if (!name) {
    return null;
  }

  return {
    id,
    name,
  };
}

function collectCategoryListsFromPayload(payload = {}) {
  const lists = [
    payload?.categories,
    payload?.categoryList,
    payload?.productCategories,
    payload?.data?.categories,
    payload?.data?.categoryList,
    payload?.data?.productCategories,
  ];

  return lists.filter((list) => Array.isArray(list) && list.length > 0);
}

export function extractCategoriesFromCatalogResponse(response, products = []) {
  const payload = response?.data ?? response ?? {};
  const map = new Map();

  const addCategory = (item) => {
    const normalized = normalizeCategoryOption(item);
    if (!normalized) return;
    map.set(String(normalized.id), normalized);
  };

  collectCategoryListsFromPayload(payload).forEach((list) => {
    list.forEach(addCategory);
  });

  products.forEach((product) => {
    if (!isProductRow(product)) return;

    const candidates = [];

    if (product.categoryListDTO && !Array.isArray(product.categoryListDTO)) {
      candidates.push(product.categoryListDTO);
    }

    if (product.category && !Array.isArray(product.category)) {
      candidates.push(product.category);
    }

    if (product.categoryId != null) {
      candidates.push({
        id: product.categoryId,
        name: product.categoryName || product.categoryTitle,
      });
    }

    candidates.forEach(addCategory);
  });

  return Array.from(map.values());
}

export function extractCategoriesFromList(list = []) {
  if (!Array.isArray(list)) return [];

  const map = new Map();

  list.forEach((item) => {
    const normalized = normalizeCategoryOption(item);
    if (!normalized) return;
    map.set(String(normalized.id), normalized);
  });

  return Array.from(map.values());
}

export function normalizeAdminProductList(response) {
  const payload = response?.data ?? response ?? {};

  if (Array.isArray(payload?.products)) return payload.products;
  if (Array.isArray(payload?.data?.products)) return payload.data.products;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.data?.content)) return payload.data.content;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;

  return [];
}

export function normalizeMerchantProductList(response) {
  const payload = response?.data ?? response ?? {};

  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.data?.content)) return payload.data.content;

  return [];
}
