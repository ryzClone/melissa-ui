export const normalizeProductList = (res) => {
  const payload = res?.data;

  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;

  return [];
};

export const normalizeProductDetail = (res) => {
  const payload = res?.data;
  return payload?.data ?? payload ?? null;
};

export function extractListResponse(payload) {
  const content = normalizeProductList(payload);
  return {
    content,
    totalElements: content.length,
    totalPages: 1,
    number: 0,
  };
}

export const extractObject = normalizeProductDetail;

export function productName(product) {
  return (
    product?.nameUz ||
    product?.name ||
    product?.nameEn ||
    product?.nameRu ||
    product?.title ||
    "-"
  );
}

export function productImage(product) {
  return (
    product?.attachment?.path ||
    product?.imageUrl ||
    product?.attachmentUrl ||
    product?.attachment?.url ||
    product?.image?.url ||
    product?.imagePath ||
    ""
  );
}

export function productCategory(product) {
  return (
    product?.categoryListDTO?.name ||
    product?.category?.nameUz ||
    product?.category?.name ||
    product?.categoryName ||
    product?.categoryNameUz ||
    "-"
  );
}

export function productPrice(product) {
  const value =
    product?.price ?? product?.basePrice ?? product?.amount ?? null;
  if (value === null || value === undefined || value === "") return "0 so'm";
  return `${Number(value).toLocaleString("uz-UZ")} so'm`;
}

export function productMeasure(product) {
  const value = product?.measure;
  if (value === null || value === undefined || value === "") return "-";
  return value;
}

export function productPreparation(product) {
  const value = product?.preparationDurationMinutes;
  if (value === null || value === undefined || value === "") return "-";
  return `${value} daqiqa`;
}

export function productModifierCount(product) {
  const groups = product?.modifierGroups;
  if (!Array.isArray(groups) || groups.length === 0) return "-";
  return `${groups.length} ta guruh`;
}

export function productDiscountPrice(product) {
  const value =
    product?.discountPrice ??
    product?.priceWithDiscount ??
    product?.salePrice ??
    null;
  if (value === null || value === undefined || value === "") return "-";
  return `${Number(value).toLocaleString("uz-UZ")} so'm`;
}

export function productCreatedDate(product) {
  const raw = product?.createdAt || product?.createdDate || product?.created;
  if (!raw) return "-";
  try {
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return String(raw);
    return date.toLocaleDateString("uz-UZ", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return String(raw);
  }
}

export function productStatus(product) {
  if (typeof product?.active === "boolean") return product.active;
  if (typeof product?.status === "string") return product.status;
  return null;
}
