import apiClient from "../apiClient";

const BASE_URL = "/api/v1/merchant-role";

export const organizationRoleApi = {
  getList: (params) => {
    return apiClient.get(BASE_URL, { params });
  },

  update: (payload) => {
    return apiClient.put(BASE_URL, payload);
  },

  create: (payload) => {
    return apiClient.post(BASE_URL, payload);
  },

  exists: (params) => {
    return apiClient.get(`${BASE_URL}/exists`, { params });
  },

  getAll: () => {
    return apiClient.get(`${BASE_URL}/all`);
  },

  delete: (id) => {
    return apiClient.delete(`${BASE_URL}/${id}`);
  },

  getPermissions: (roleId) => {
    return apiClient.get(`${BASE_URL}/${roleId}/permissions`);
  },

  addPermission: (roleId, permissionId) => {
    return apiClient.post(`${BASE_URL}/${roleId}/permissions/${permissionId}`);
  },

  removePermission: (roleId, permissionId) => {
    return apiClient.delete(
      `${BASE_URL}/${roleId}/permissions/${permissionId}`
    );
  },
};
