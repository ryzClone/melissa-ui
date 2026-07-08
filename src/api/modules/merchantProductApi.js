import apiClient from "../apiClient";
import { buildListParams } from "@/utils/buildListParams";

const BASE_URL = "/catalog/api/v1/merchant-product";

export const merchantProductApi = {
  getList: (filters = {}) =>
    apiClient.get(BASE_URL, {
      params: buildListParams(filters),
    }),
  getById: (id, params) => apiClient.get(`${BASE_URL}/${id}`, { params }),
  getBranchList: (params) => apiClient.get(`${BASE_URL}/branch/list`, { params }),
};
