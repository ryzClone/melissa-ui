import apiClient from "../apiClient";

const BASE_URL = "/catalog/api/v1/organization-branch";

export const organizationBranchApi = {
  getList: (params) => {
    return apiClient.get(BASE_URL, { params });
  },

  getAll: () => {
    return apiClient.get(`${BASE_URL}/all`);
  },

  getAllBranches: () => {
    return apiClient.get(`${BASE_URL}/all`);
  },

  getById: (id) => {
    return apiClient.get(`${BASE_URL}/${id}`);
  },

  create: (data) => {
    return apiClient.post(BASE_URL, data);
  },

  update: (id, data) => {
    return apiClient.put(`${BASE_URL}/${id}`, data);
  },

  delete: (id) => {
    return apiClient.delete(`${BASE_URL}/${id}`);
  },
};
