import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { useAdminAuthStore } from "../stores/adminAuthStore";
import { useUserAuthStore } from "../stores/userAuthStore";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export interface CustomAxiosInstance {
  defaults: any;
  interceptors: AxiosInstance["interceptors"];
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
  request<T = any>(config: AxiosRequestConfig): Promise<T>;
  (config: AxiosRequestConfig): Promise<any>;
  (url: string, config?: AxiosRequestConfig): Promise<any>;
}

const instance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Send and receive cookies (essential for httpOnly refresh tokens)
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

instance.interceptors.request.use(
  (config) => {
    let token: string | null = null;
    const url = config.url || "";

    // Decide which token to attach based on routing patterns.
    const isAdminRoute =
      url.includes("/admin") ||
      (typeof window !== "undefined" && window.location.pathname.startsWith("/admin"));

    if (isAdminRoute) {
      token = useAdminAuthStore.getState().accessToken;
    } else {
      token = useUserAuthStore.getState().accessToken;
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response) => {
    const responseData = response.data;
    // Unwrap the `{ success: true, message, data }` standard response structure
    return responseData.data !== undefined ? responseData.data : responseData;
  },
  (error) => {
    const originalRequest = error.config;

    // Prevent infinite loop if the refresh endpoint itself returns 401
    const isAuthEndpoint =
      originalRequest?.url?.includes("/auth/login") ||
      originalRequest?.url?.includes("/auth/admin/login") ||
      originalRequest?.url?.includes("/auth/change-password") ||
      originalRequest?.url?.includes("/auth/refresh");

    if (error.response?.status === 401 && !originalRequest?._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return instance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      isRefreshing = true;

      return new Promise((resolve, reject) => {
        instance
          .post("/auth/refresh")
          .then((res: any) => {
            // Unwrapped response contains the new accessToken
            const newAccessToken = res.accessToken;

            const url = originalRequest.url || "";
            const isAdminRoute =
              url.includes("/admin") ||
              (typeof window !== "undefined" && window.location.pathname.startsWith("/admin"));

            if (isAdminRoute) {
              const { setAuth, adminInfo } = useAdminAuthStore.getState();
              if (adminInfo) {
                setAuth(newAccessToken, adminInfo);
              }
            } else {
              const { setAuth, userInfo } = useUserAuthStore.getState();
              if (userInfo) {
                setAuth(newAccessToken, userInfo);
              }
            }

            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            processQueue(null, newAccessToken);
            resolve(instance(originalRequest));
          })
          .catch((refreshError) => {
            processQueue(refreshError, null);

            // Log out user/admin if token refresh fails
            const url = originalRequest.url || "";
            const isAdminRoute =
              url.includes("/admin") ||
              (typeof window !== "undefined" && window.location.pathname.startsWith("/admin"));

            if (isAdminRoute) {
              useAdminAuthStore.getState().logout();
            } else {
              useUserAuthStore.getState().logout();
            }

            reject(refreshError);
          })
          .finally(() => {
            isRefreshing = false;
          });
      });
    }

    const errorData = error.response?.data || {};
    const message = errorData.message;
    const errorMessage = Array.isArray(message)
      ? message.join(", ")
      : typeof message === "string"
      ? message
      : error.message || "API request failed";
    return Promise.reject(new Error(errorMessage));
  }
);

export const apiClient = instance as unknown as CustomAxiosInstance;
