import apiClient from "../apiClient";

const BASE_URL = "/api/v1/profile";

export const profileApi = {
  getMe: () => apiClient.get(`${BASE_URL}/me`),
  update: (payload) => apiClient.put(BASE_URL, payload),
};

export function extractProfileData(response) {
  return response?.data?.data ?? response?.data ?? null;
}
