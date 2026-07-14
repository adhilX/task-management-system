import { apiClient } from "../utils/apiClient";

export interface TaskQueryParams {
  limit?: number;
  page?: number;
  status?: string;
  priority?: string;
  projectId?: string;
}

export const taskService = {
  getTasks: async (params?: TaskQueryParams) => {
    return apiClient.get("/tasks", { params });
  },

  createTask: async (payload: any) => {
    return apiClient.post("/tasks", payload);
  },

  updateTask: async (id: string, payload: any) => {
    return apiClient.patch(`/tasks/${id}`, payload);
  },

  deleteTask: async (id: string) => {
    return apiClient.delete(`/tasks/${id}`);
  },
};
