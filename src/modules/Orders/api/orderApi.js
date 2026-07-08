import apiClient from "@/api/apiClient";

const BASE_URL = "/order/api/v1/merchant-order";

/**
 * Orders API.
 *
 * Current: GET /merchant-order/current
 * History: GET /merchant-order/history?fromDate&toDate (+ organizationId for admin)
 * Response: { data: Order[], errorMessage }
 */
export const orderApi = {
  getCurrentOrders: (params) => apiClient.get(`${BASE_URL}/current`, { params }),

  getOrderHistory: (params) => apiClient.get(`${BASE_URL}/history`, { params }),

  // NEW -> ACCEPTED
  // agar backend PATCH bo'lsa post o'rniga patch ishlatilsin
  acceptOrder: (id) => apiClient.post(`${BASE_URL}/${id}/accept`),

  // ACCEPTED -> COOKING
  // agar backend PATCH bo'lsa post o'rniga patch ishlatilsin
  startCooking: (id) => apiClient.post(`${BASE_URL}/${id}/start-cooking`),

  // COOKING -> DONE
  // agar backend PATCH bo'lsa post o'rniga patch ishlatilsin
  readyOrder: (id) => apiClient.post(`${BASE_URL}/${id}/ready`),
};

export default orderApi;
