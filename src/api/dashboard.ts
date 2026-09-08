import { api } from "./api";

export const dashboardApi = {
  getStats: () => api.get("/dashboard"),
};
