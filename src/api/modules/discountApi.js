import apiClient from "../apiClient";

const BASE_URL = "/catalog/api/v1/discount";

const normalizeDiscountListResponse = (response) => {
  const payload = response?.data ?? response ?? {};
  const content = payload?.content;

  return {
    ...payload,
    content: Array.isArray(content) ? content : [],
  };
};

export const discountApi = {
  getDiscounts: async (params) => {
    const response = await apiClient.get(BASE_URL, { params });
    return normalizeDiscountListResponse(response);
  },

  getDiscountById: (id) => {
    return apiClient.get(`${BASE_URL}/${id}`);
  },

  createDiscount: (payload) => {
    return apiClient.post(BASE_URL, payload);
  },

  updateDiscount: (id, payload) => {
    return apiClient.put(`${BASE_URL}/${id}`, payload);
  },

  deleteDiscount: (id) => {
    return apiClient.delete(`${BASE_URL}/${id}`);
  },
};

