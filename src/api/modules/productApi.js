import apiClient from "../apiClient";

const BASE_URL = "/catalog/api/v1/product";

export const productApi = {
  create: (payload) => apiClient.post(BASE_URL, payload),
  update: (id, payload) => apiClient.put(`${BASE_URL}/${id}`, payload),
  delete: (id) => apiClient.delete(`${BASE_URL}/${id}`),
  getById: (id) => apiClient.get(`${BASE_URL}/${id}`),
  pricePreview: (payload) =>
    apiClient.post(`${BASE_URL}/price-preview`, payload),
};
