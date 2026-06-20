import apiClient from "../apiClient";

const BASE_URL = "/api/v1/user";

export const userControllerApi = {
  /** Partner list for Super Admin selector */
  getUnrelatedMerchants: (params) =>
    apiClient.get(`${BASE_URL}/unrelated-merchants`, { params }),

  getMerchantUsers: (params) =>
    apiClient.get(`${BASE_URL}/merchant-users`, { params }),

  getMerchantUserById: (id) =>
    apiClient.get(`${BASE_URL}/merchant-users/${id}`),

  updateMerchantUser: (id, payload) =>
    apiClient.put(`${BASE_URL}/merchant-users/${id}`, payload),

  deleteMerchantUser: (id) =>
    apiClient.delete(`${BASE_URL}/merchant-users/${id}`),

  createUser: (payload, params) => {
    const hasParams = params && Object.keys(params).length > 0;
    return apiClient.post(BASE_URL, payload, hasParams ? { params } : undefined);
  },

  resetFreeLimit: (payload) =>
    apiClient.put(`${BASE_URL}/reset/free-limit`, payload),
};

/** Super Admin users API — list from merchant-users with organizationId, view-only */
export const userControllerUsersApi = {
  getById: (id) => userControllerApi.getMerchantUserById(id),
  getList: (params) => userControllerApi.getMerchantUsers(params),
  create: () => Promise.reject(new Error("Super Admin uchun ruxsat yo'q")),
  update: () => Promise.reject(new Error("Super Admin uchun ruxsat yo'q")),
  delete: () => Promise.reject(new Error("Super Admin uchun ruxsat yo'q")),
  resetFreeLimit: () =>
    Promise.reject(new Error("Super Admin uchun ruxsat yo'q")),
};
