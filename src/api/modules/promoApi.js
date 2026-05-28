import apiClient from "../apiClient";

const BASE_URL = "/catalog/api/v1/promo";

export const parsePromoList = (response) => {
  const list =
    response?.data?.content ||
    response?.content ||
    response?.data ||
    [];

  return Array.isArray(list) ? list : [];
};

export const promoApi = {
  getPromos: async (params) => {
    const response = await apiClient.get(BASE_URL, { params });
    return response;
  },

  getPromoById: (id) => {
    return apiClient.get(`${BASE_URL}/${id}`);
  },

  createPromo: (payload) => {
    return apiClient.post(BASE_URL, payload);
  },

  updatePromo: (id, payload) => {
    return apiClient.put(`${BASE_URL}/${id}`, payload);
  },

  deletePromo: (id) => {
    return apiClient.delete(`${BASE_URL}/${id}`);
  },
};
