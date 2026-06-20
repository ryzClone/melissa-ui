import apiClient from "../apiClient";
import { buildListParams } from "@/utils/buildListParams";

const BASE_URL = "/catalog/api/v1/product";

/** Super Admin product list: GET /api/v1/product/by-organization/{organizationId} */
export const adminProductApi = {
  getByOrganization: (organizationId, params = {}) => {
    const id = Number(organizationId);

    if (!Number.isFinite(id)) {
      return Promise.reject(new Error("organizationId is required"));
    }

    return apiClient.get(`${BASE_URL}/by-organization/${id}`, {
      params: buildListParams(params),
    });
  },
};
