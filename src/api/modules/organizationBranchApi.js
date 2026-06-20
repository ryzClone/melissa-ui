import apiClient from "../apiClient";
import { buildListParams } from "@/utils/buildListParams";

const CATALOG_BASE_URL = "/catalog/api/v1/organization-branch";
const MAIN_BASE_URL = "/catalog/api/v1/organization-branch";

export const organizationBranchApi = {
  /** GET /catalog/api/v1/organization-branch/all */
  getAll: (params) => apiClient.get(`${CATALOG_BASE_URL}`, { params }),

  getList: (params) => apiClient.get(`${CATALOG_BASE_URL}/all`, { params }),

  getAllBranches: (params) => apiClient.get(`${CATALOG_BASE_URL}/`, { params }),

  /** GET /api/v1/organization-branch/by-org — main API, not catalog */
  getByOrg: (params) => apiClient.get(`${MAIN_BASE_URL}/by-org`, { params }),

  /** GET /catalog/api/v1/organization-branch?organizationId={id} */
  getByOrganizationId: (organizationId) => {
    const params = buildListParams({
      organizationId: Number(organizationId),
    });

    if (!Number.isFinite(params.organizationId)) {
      return Promise.resolve({ data: [] });
    }

    return apiClient.get(CATALOG_BASE_URL, { params });
  },

  getById: (id, params) => {
    const query = buildListParams(params);
    const hasQuery = Object.keys(query).length > 0;

    return apiClient.get(
      `${CATALOG_BASE_URL}/${id}`,
      hasQuery ? { params: query } : undefined
    );
  },

  create: (data) => apiClient.post(CATALOG_BASE_URL, data),

  /** Super Admin: POST /catalog/api/v1/organization-branch?organizationId={id} */
  createForOrganization: (organizationId, data) => {
    const params = buildListParams({
      organizationId: Number(organizationId),
    });

    if (!Number.isFinite(params.organizationId)) {
      return Promise.reject(new Error("organizationId is required"));
    }

    return apiClient.post(CATALOG_BASE_URL, data, { params });
  },

  update: (id, data) => apiClient.put(`${CATALOG_BASE_URL}/${id}`, data),

  delete: (id) => apiClient.delete(`${CATALOG_BASE_URL}/${id}`),
};
