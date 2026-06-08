import type { RootState } from "@/store";

export const selectAuth = (state: RootState) => state.auth;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectAuthUser = (state: RootState) => state.auth.user;
export const selectIsAdmin = (state: RootState) =>
  state.auth.user?.roles?.includes("admin") ?? false;
export const selectUserRoles = (state: RootState) => state.auth.user?.roles ?? [];
