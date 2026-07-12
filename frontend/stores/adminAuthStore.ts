import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface AdminInfo {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AdminAuthState {
  accessToken: string | null;
  adminInfo: AdminInfo | null;
  isAuthenticated: boolean;
  setAuth: (token: string, adminInfo: AdminInfo) => void;
  logout: () => void;
}

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      adminInfo: null,
      isAuthenticated: false,
      setAuth: (token, adminInfo) =>
        set({
          accessToken: token,
          adminInfo,
          isAuthenticated: true,
        }),
      logout: () =>
        set({
          accessToken: null,
          adminInfo: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: "admin-auth-storage", // Key name in localStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
);
