"use client";

import { useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { APP_ROUTES } from "@/lib/constants/appConstants";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { selectAuth, selectIsAdmin, selectUserRoles, selectUserPermissions } from "@/store/modules/auth/authSelectors";
import { logoutRequest } from "@/store/modules/auth/authSlice";
import type { ModulePermission } from "@/types/models/User";

export const useAuth = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const auth = useAppSelector(selectAuth);
  const isAdmin = useAppSelector(selectIsAdmin);
  const roles = useAppSelector(selectUserRoles);
  const permissions = useAppSelector(selectUserPermissions);

  const can = useCallback(
    (module: string, action: "view" | "create" | "edit" | "delete"): boolean => {
      if (isAdmin) return true;
      const field = `can${action.charAt(0).toUpperCase() + action.slice(1)}` as keyof ModulePermission;
      return permissions.some((p) => p.module === module && p[field]);
    },
    [isAdmin, permissions],
  );

  const modulePermissions = useCallback(
    (module: string): ModulePermission | undefined =>
      permissions.find((p) => p.module === module),
    [permissions],
  );

  return useMemo(
    () => ({
      ...auth,
      isAdmin,
      roles,
      permissions,
      can,
      modulePermissions,
      logout: () => {
        dispatch(logoutRequest());
        router.replace(APP_ROUTES.login);
      },
    }),
    [auth, isAdmin, roles, permissions, can, modulePermissions, dispatch, router],
  );
};
