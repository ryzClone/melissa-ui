import axios from "axios";

const apiClient = axios.create({
  baseURL: "https://dev-api.mtechdynamics.uz",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("accessToken") || localStorage.getItem("token");

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error?.response?.status;
    const hasToken = Boolean(
      localStorage.getItem("accessToken") || localStorage.getItem("token")
    );
    let message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      "Server bilan bog‘lanishda xatolik yuz berdi";

    if (status === 401) {
      message = "Sessiya tugagan. Qayta login qiling";

      if (!hasToken && typeof window !== "undefined" && window.location?.pathname !== "/login") {
        window.location.href = "/login";
      }
    } else if (status === 403) {
      message = "Sizda bu amal uchun ruxsat yo‘q";
    } else if (status === 404) {
      message = "Ma’lumot topilmadi";
    }

    return Promise.reject({
      status,
      message,
      data: error?.response?.data,
    });
  }
);

export default apiClient;