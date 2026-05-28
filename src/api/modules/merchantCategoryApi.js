import apiClient from "../apiClient";

const BASE_URL = "/catalog/api/v1/merchant-product/category/list";

export const merchantCategoryApi = {
  getAll: () => apiClient.get(`${BASE_URL}`),
};
