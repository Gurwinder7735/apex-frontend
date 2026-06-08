import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { API_RETRY_COUNT, API_TIMEOUT_MS } from "@/lib/constants/apiConstants";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { attachRequestInterceptor, attachResponseInterceptor } from "@/lib/api/interceptors";
import { storage } from "@/lib/utils/storage";

const baseURL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const axiosInstance = axios.create({
  baseURL,
  timeout: API_TIMEOUT_MS,
  headers: {
    "Content-Type": "application/json",
  },
});

const refreshTokenFn = async (): Promise<string | null> => {
  let storedRefreshToken = storage.getRefreshToken();
  if (!storedRefreshToken && typeof document !== "undefined") {
    storedRefreshToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("refresh_token="))
      ?.split("=")[1] ?? null;
  }
  console.log("[Auth] refreshTokenFn called, refresh token exists:", !!storedRefreshToken);
  if (!storedRefreshToken) return null;
  try {
    const response = await axios.post<{ data: { accessToken: string } }>(
      `${baseURL}${API_ENDPOINTS.auth.refresh}`,
      { refresh_token: storedRefreshToken },
      { withCredentials: true },
    );
    const newToken = response.data.data.accessToken;
    console.log("[Auth] Token refresh API succeeded");
    storage.setAccessToken(newToken);
    document.cookie = `access_token=${newToken}; path=/; max-age=604800; SameSite=Lax; Secure`;
    return newToken;
  } catch (err) {
    console.log("[Auth] Token refresh API failed, clearing everything");
    storage.clearAll();
    document.cookie = "access_token=; path=/; max-age=0; SameSite=Lax";
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    return null;
  }
};

attachRequestInterceptor(axiosInstance);
attachResponseInterceptor(axiosInstance, refreshTokenFn);

axiosInstance.interceptors.response.use(undefined, async (error: AxiosError) => {
  const config = error.config as (AxiosRequestConfig & { _retryCount?: number }) | undefined;
  if (!config || error.response) {
    return Promise.reject(error);
  }
  config._retryCount = (config._retryCount ?? 0) + 1;
  if (config._retryCount > API_RETRY_COUNT) {
    return Promise.reject(error);
  }
  return axiosInstance(config);
});

export const apiRequest = async <T>(config: AxiosRequestConfig): Promise<T> => {
  const response: AxiosResponse<T> = await axiosInstance.request<T>(config);
  return response.data;
};

export default axiosInstance;
