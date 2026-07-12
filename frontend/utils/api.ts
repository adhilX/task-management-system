import { useAdminAuthStore } from "../stores/adminAuthStore";
import { useUserAuthStore } from "../stores/userAuthStore";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | undefined>;
}

export async function apiFetch<T = any>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { params, headers, ...restOptions } = options;

  // Build URL with query params
  let url = `${API_BASE_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  // Determine token to attach
  // If endpoint is admin-related or store is admin, we attach admin token, otherwise user token.
  let token: string | null = null;
  const isAdminRoute = endpoint.includes("/admin") || window.location.pathname.startsWith("/dashboard");
  
  if (isAdminRoute) {
    token = useAdminAuthStore.getState().accessToken;
  } else {
    token = useUserAuthStore.getState().accessToken;
  }

  // Setup default headers
  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    headers: {
      ...defaultHeaders,
      ...headers,
    },
    ...restOptions,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API error: ${response.status}`);
  }

  const responseData = await response.json();
  return responseData.data !== undefined ? responseData.data : responseData;
}
