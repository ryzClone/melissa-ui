import apiClient from "@/api/apiClient";

const BASE_URL = "/order/api/v1/merchant-order";

/**
 * Orders API.
 *
 * Status flow: NEW -> ACCEPTED -> COOKING -> (DONE / boshqa) .
 * Response shape: { data: { message }, errorMessage }.
 *
 * NOTE: agar backend PATCH kutsa, post o'rniga patch ishlatilsin.
 */
export const orderApi = {
  getCurrentOrders: () => apiClient.get(`${BASE_URL}/current`),

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
