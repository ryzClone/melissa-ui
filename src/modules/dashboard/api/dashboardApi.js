import apiClient from "@/api/apiClient";
import { buildListParams } from "@/utils/buildListParams";

const BASE_URL = "/order/api/v1/merchant-dashboard";

function triggerBlobDownload(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export const dashboardApi = {
  getDashboard: (params = {}) =>
    apiClient.get(`${BASE_URL}/dashboard`, {
      params: buildListParams(params),
    }),

  downloadReport: async (params = {}) => {
    const queryParams = buildListParams(params);
    const blob = await apiClient.get(`${BASE_URL}/report`, {
      params: queryParams,
      responseType: "blob",
      meta: { skipDedupe: true },
    });

    const startDate = queryParams.startDate || "report";
    const endDate = queryParams.endDate || startDate;
    const filename = `dashboard-report-${startDate}_${endDate}.xlsx`;

    triggerBlobDownload(blob, filename);
  },
};

export default dashboardApi;
