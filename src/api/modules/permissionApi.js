import apiClient from "../apiClient";

const BASE_URL = "/catalog/api/v1/permission";

export const permissionApi = {
  getAll: () => {
    return apiClient.get(`${BASE_URL}/all`);
  },

  getList: (params) => {
    return apiClient.get(BASE_URL, { params });
  },

  getById: (id) => {
    return apiClient.get(`${BASE_URL}/${id}`);
  },
};
