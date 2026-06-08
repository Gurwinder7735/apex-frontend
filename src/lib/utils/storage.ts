import { STORAGE_KEYS } from "@/lib/constants/appConstants";

export const storage = {
  getAccessToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(STORAGE_KEYS.accessToken);
  },
  setAccessToken: (token: string): void => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEYS.accessToken, token);
    }
  },
  clearAccessToken: (): void => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEYS.accessToken);
    }
  },
  getRefreshToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(STORAGE_KEYS.refreshToken);
  },
  setRefreshToken: (token: string): void => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEYS.refreshToken, token);
    }
  },
  clearRefreshToken: (): void => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEYS.refreshToken);
    }
  },
  clearAll: (): void => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEYS.accessToken);
      window.localStorage.removeItem(STORAGE_KEYS.refreshToken);
    }
  },
};
