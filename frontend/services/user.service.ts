import { apiClient } from "../utils/apiClient";

export interface UserQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}

export const userService = {
  getUsers: async (params?: UserQueryParams) => {
    return apiClient.get("/users", { params });
  },

  inviteEmployee: async (payload: any) => {
    return apiClient.post("/users/invite", payload);
  },

  getUserById: async (id: string) => {
    return apiClient.get(`/users/${id}`);
  },

  updateUser: async (id: string, payload: any) => {
    return apiClient.patch(`/users/${id}`, payload);
  },

  updateUserStatus: async (id: string, status: string) => {
    return apiClient.patch(`/users/${id}/status`, { status });
  },

  deleteUser: async (id: string) => {
    return apiClient.delete(`/users/${id}`);
  },
};
