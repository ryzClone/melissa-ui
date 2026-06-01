import apiClient from "../apiClient";

const BASE_URL = "/api/v1/merchant-product";

export const merchantProductApi = {
  getList: (params) => apiClient.get(BASE_URL, { params }),
  getById: (id) => apiClient.get(`${BASE_URL}/${id}`),
  getBranchList: () => apiClient.get(`${BASE_URL}/branch/list`),
};
