import axios from "axios";
import "@/services/toastStore";
import {
  attachMutationToastHandlers,
  setupAxiosInterceptors,
} from "@/api/setupAxiosInterceptors";

const apiClient = axios.create({
  baseURL: "https://api.mtechdynamics.uz",
  headers: {
    "Content-Type": "application/json",
  },
});

setupAxiosInterceptors(apiClient, {
  unwrapResponse: false,
  enableServerOfflineGuard: false,
});

attachMutationToastHandlers(apiClient);

export default apiClient;
