import apiClient from "../apiClient";

const BASE_URL = "/api/v1/merchant-user";

export const organizationUserApi = {
  getById: (id) => apiClient.get(`${BASE_URL}/${id}`),

  getList: (params) => apiClient.get(BASE_URL, { params }),

  create: (payload, params) => {
    const hasParams = params && Object.keys(params).length > 0;
    return apiClient.post(BASE_URL, payload, hasParams ? { params } : undefined);
  },

  update: (id, payload) => apiClient.put(`${BASE_URL}/${id}`, payload),

  delete: (id) => apiClient.delete(`${BASE_URL}/${id}`),

  uploadAttachment: (payload) => {
    return apiClient.post("/api/attachments/upload", payload, {
      headers: {
        "Content-Type": "application/json",
      },
      meta: {
        skipSuccessNotification: true,
      },
    });
  },

  getAttachment: (id) => {
    return apiClient.get(`/api/attachments/${id}`);
  },

  deleteAttachment: (id) => {
    return apiClient.delete(`/api/attachments/${id}`);
  },
};
