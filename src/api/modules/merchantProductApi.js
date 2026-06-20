import apiClient from "../apiClient";

const BASE_URL = "/catalog/api/v1/merchant-product";

export const merchantProductApi = {
  getList: (params) => apiClient.get(BASE_URL, { params }),
  getById: (id, params) => apiClient.get(`${BASE_URL}/${id}`, { params }),
  getBranchList: (params) => apiClient.get(`${BASE_URL}/branch/list`, { params }),
};
