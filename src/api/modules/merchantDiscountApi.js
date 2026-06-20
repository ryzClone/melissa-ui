import apiClient from "../apiClient";

const BASE_URL = "/catalog/api/v1/merchant-discount";

const normalizeListResponse = (response) => {
  const payload = response?.data ?? response ?? {};
  const content =
    payload?.content ??
    payload?.data?.content ??
    (Array.isArray(payload?.data) ? payload.data : null);

  return {
    ...payload,
    content: Array.isArray(content) ? content : [],
  };
};

/** Super Admin discount list: GET /api/v1/merchant-discount?organizationId=... */
export const merchantDiscountApi = {
  getList: async (params) => {
    const response = await apiClient.get(BASE_URL, { params });
    return normalizeListResponse(response);
  },
};
