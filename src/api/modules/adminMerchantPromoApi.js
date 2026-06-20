import apiClient from "../apiClient";

const BASE_URL = "/catalog/api/v1/merchant-promo";

/** Super Admin promo list: GET /api/v1/merchant-promo?organizationId=... */
export const adminMerchantPromoApi = {
  getList: (params) => apiClient.get(BASE_URL, { params }),
};
