import axios from "axios";

const apiClient = axios.create({
  baseURL: "https://dev-api.mtechdynamics.uz",
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("accessToken") || localStorage.getItem("token");

  if (token && config.url !== "/api/v1/auth/login") {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default apiClient;