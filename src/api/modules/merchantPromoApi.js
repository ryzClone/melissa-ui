import apiClient from "../apiClient";

const BASE_URL = "/catalog/api/v1/merchant-promo";
const PRODUCT_LIST_URL = "/catalog/api/v1/merchant-product/list";

const normalizeMerchantPromoList = (response) => {
  const payload = response?.data ?? response ?? {};
  const content = payload?.content;

  return {
    ...payload,
    content: Array.isArray(content) ? content : [],
  };
};

export const merchantPromoApi = {
  getMerchantPromos: async (params) => {
    const response = await apiClient.get(BASE_URL, { params });
    return normalizeMerchantPromoList(response);
  },

  getMerchantPromoById: (id) => {
    return apiClient.get(`${BASE_URL}/${id}`);
  },

  createMerchantPromo: (payload) => {
    return apiClient.post(BASE_URL, payload);
  },

  updateMerchantPromo: (id, payload) => {
    return apiClient.put(`${BASE_URL}/${id}`, payload);
  },

  deleteMerchantPromo: (id) => {
    return apiClient.delete(`${BASE_URL}/${id}`);
  },

  // merchant product list uchun
  getMerchentPromoList: async () => {
    const response = await apiClient.get(PRODUCT_LIST_URL);

    return response?.data ?? [];
  },
};