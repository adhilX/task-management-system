import { apiClient } from "../utils/apiClient";

export const projectService = {
  getProjects: async () => {
    return apiClient.get("/projects");
  },

  createProject: async (payload: any) => {
    return apiClient.post("/projects", payload);
  },

  updateProject: async (id: string, payload: any) => {
    return apiClient.patch(`/projects/${id}`, payload);
  },

  deleteProject: async (id: string) => {
    return apiClient.delete(`/projects/${id}`);
  },

  getProjectMembers: async (id: string) => {
    return apiClient.get(`/projects/${id}/members`);
  },
};
