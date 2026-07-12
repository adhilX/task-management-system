import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface UserInfo {
  id: string;
  email: string;
  name: string;
  department?: string;
  role: string;
}

interface UserAuthState {
  accessToken: string | null;
  userInfo: UserInfo | null;
  isAuthenticated: boolean;
  setAuth: (token: string, userInfo: UserInfo) => void;
  logout: () => void;
}

export const useUserAuthStore = create<UserAuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      userInfo: null,
      isAuthenticated: false,
      setAuth: (token, userInfo) =>
        set({
          accessToken: token,
          userInfo,
          isAuthenticated: true,
        }),
      logout: () =>
        set({
          accessToken: null,
          userInfo: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: "employee-auth-storage", // Key name in localStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
);
