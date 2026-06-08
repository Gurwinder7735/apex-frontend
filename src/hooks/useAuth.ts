"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { APP_ROUTES } from "@/lib/constants/appConstants";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { selectAuth, selectIsAdmin, selectUserRoles } from "@/store/modules/auth/authSelectors";
import { logoutRequest } from "@/store/modules/auth/authSlice";

export const useAuth = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const auth = useAppSelector(selectAuth);
  const isAdmin = useAppSelector(selectIsAdmin);
  const roles = useAppSelector(selectUserRoles);

  return useMemo(
    () => ({
      ...auth,
      isAdmin,
      roles,
      logout: () => {
        dispatch(logoutRequest());
        router.replace(APP_ROUTES.login);
      },
    }),
    [auth, isAdmin, roles, dispatch, router],
  );
};
