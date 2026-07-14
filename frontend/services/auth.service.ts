import { apiClient } from "../utils/apiClient";

export const authService = {
  getRegistrationStatus: async () => {
    return apiClient.get<{ isLocked: boolean }>("/auth/register-status");
  },

  registerAdmin: async (payload: any) => {
    return apiClient.post("/auth/register", payload);
  },

  login: async (payload: any) => {
    return apiClient.post("/auth/login", payload);
  },

  adminLogin: async (payload: any) => {
    return apiClient.post("/auth/admin/login", payload);
  },

  getCurrentUser: async () => {
    return apiClient.get("/auth/me");
  },

  changePassword: async (payload: any) => {
    return apiClient.post("/auth/change-password", payload);
  },

  verifyInvite: async (token: string) => {
    return apiClient.get(`/auth/invite/verify/${token}`);
  },

  activateInvite: async (payload: any) => {
    return apiClient.post("/auth/invite/activate", payload);
  },
};
