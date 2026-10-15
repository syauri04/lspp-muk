import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
  type AxiosResponse,
  type AxiosError,
} from "axios";
import { getStoredToken, removeStoredAuth } from "@/lib/auth/authStore";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

/** Event global saat token ditolak server (401); AuthProvider mendengarkan ini. */
export const UNAUTHORIZED_EVENT = "muk:unauthorized";

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getStoredToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    const isLoginRequest = error.config?.url?.includes("/auth/") && error.config?.url?.endsWith("/login");

    if (error.response?.status === 401 && !isLoginRequest && typeof window !== "undefined") {
      removeStoredAuth();
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }
    return Promise.reject(error);
  },
);

/** Ambil pesan error yang aman ditampilkan ke user. */
export function pesanError(error: unknown, fallback = "Terjadi kesalahan. Silakan coba lagi."): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) return "Tidak dapat terhubung ke server. Periksa koneksi Anda.";
    const data = error.response.data as { message?: string; errors?: Record<string, string[]> } | undefined;
    const firstFieldError = data?.errors ? Object.values(data.errors)[0]?.[0] : undefined;
    return firstFieldError || data?.message || fallback;
  }
  return fallback;
}

/** Error validasi per field (422), untuk ditampilkan di bawah input. */
export function fieldErrors(error: unknown): Record<string, string> {
  if (axios.isAxiosError(error) && (error.response?.status === 422 || error.response?.status === 429)) {
    const errors = (error.response.data as { errors?: Record<string, string[]> })?.errors ?? {};
    return Object.fromEntries(Object.entries(errors).map(([k, v]) => [k, v[0]]));
  }
  return {};
}

export function statusError(error: unknown): number | null {
  return axios.isAxiosError(error) ? (error.response?.status ?? null) : null;
}

export default apiClient;
