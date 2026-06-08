import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { storage } from "@/lib/utils/storage";

export const attachRequestInterceptor = (api: AxiosInstance): void => {
  api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = storage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
};

export const attachResponseInterceptor = (
  api: AxiosInstance,
  refreshToken: () => Promise<string | null>,
): void => {
  api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config;
      if (
        error.response?.status === 401 &&
        originalRequest &&
        !(originalRequest as InternalAxiosRequestConfig & { _retry?: boolean })._retry
      ) {
        (originalRequest as InternalAxiosRequestConfig & { _retry?: boolean })._retry = true;
        console.log("[Auth] 401 caught, attempting token refresh...");
        const newToken = await refreshToken();
        if (newToken) {
          console.log("[Auth] Token refreshed, retrying original request");
          storage.setAccessToken(newToken);
          originalRequest.headers.set("Authorization", `Bearer ${newToken}`);
          return api(originalRequest);
        }
        console.log("[Auth] Token refresh returned null, propagating 401");
      }
      return Promise.reject(error);
    },
  );
};
