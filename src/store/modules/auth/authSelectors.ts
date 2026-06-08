import type { RootState } from "@/store";
import type { ModulePermission } from "@/types/models/User";

export const selectAuth = (state: RootState) => state.auth;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectAuthUser = (state: RootState) => state.auth.user;
export const selectIsAdmin = (state: RootState) =>
  state.auth.user?.roles?.includes("admin") ?? false;
export const selectUserRoles = (state: RootState) => state.auth.user?.roles ?? [];
export const selectUserPermissions = (state: RootState): ModulePermission[] =>
  state.auth.user?.permissions ?? [];

export const selectCan = (module: string, action: "view" | "create" | "edit" | "delete") =>
  (state: RootState): boolean => {
    const user = state.auth.user;
    if (user?.roles?.includes("admin")) return true;
    return (user?.permissions ?? []).some(
      (p) => p.module === module && p[`can${action.charAt(0).toUpperCase() + action.slice(1)}` as keyof ModulePermission],
    );
  };

export const selectModulePermissions = (module: string) =>
  (state: RootState): ModulePermission | undefined =>
    state.auth.user?.permissions?.find((p) => p.module === module);
