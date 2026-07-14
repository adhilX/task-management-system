import { apiClient } from "../utils/apiClient";

export const dashboardService = {
  getStats: async () => {
    return apiClient.get("/dashboard/stats");
  },
};
