export const DEFAULT_PAGE_SIZE = 10;

export const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50, 100, 200];

export const PAGE_SIZE_DROPDOWN_OPTIONS = DEFAULT_PAGE_SIZE_OPTIONS.map(
  (option) => ({
    label: String(option),
    value: String(option),
  })
);

export function normalizePaginationConfig(pagination = {}) {
  const page = Number(pagination.page) || 1;
  const size =
    Number(pagination.size ?? pagination.pageSize) || DEFAULT_PAGE_SIZE;
  const totalElements =
    Number(pagination.totalElements ?? pagination.total) || 0;
  const totalPages =
    Number(pagination.totalPages) ||
    Math.max(1, Math.ceil(totalElements / size) || 1);
  const pageSizeOptions =
    pagination.pageSizeOptions ?? DEFAULT_PAGE_SIZE_OPTIONS;

  return {
    page,
    size,
    totalElements,
    totalPages,
    pageSizeOptions,
  };
}

export function paginateList(list = [], page = 1, size = DEFAULT_PAGE_SIZE) {
  const totalElements = list.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / size) || 1);
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * size;

  return {
    page: safePage,
    size,
    totalElements,
    totalPages,
    content: list.slice(start, start + size),
  };
}

export function extractPaginatedResponse(raw) {
  const payload = raw?.data?.data ?? raw?.data ?? raw ?? {};
  const content = Array.isArray(payload?.content)
    ? payload.content
    : Array.isArray(payload)
      ? payload
      : [];

  const totalElements =
    payload?.totalElements ??
    payload?.page?.totalElements ??
    content.length;

  const size = payload?.size ?? payload?.page?.size ?? DEFAULT_PAGE_SIZE;
  const totalPages =
    payload?.totalPages ??
    payload?.page?.totalPages ??
    Math.max(1, Math.ceil(totalElements / size) || 1);

  return {
    content,
    totalElements,
    totalPages,
  };
}
